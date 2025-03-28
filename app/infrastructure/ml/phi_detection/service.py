# -*- coding: utf-8 -*-
"""
PHI Detection Service.

This module provides functionality for detecting and anonymizing
Protected Health Information (PHI) in clinical text for HIPAA compliance.
"""

import datetime
import logging
import re
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import yaml

from app.core.exceptions.ml_exceptions import PHIDetectionError


logger = logging.getLogger(__name__)


@dataclass
class PHIMatch:
    """Represents a detected PHI entity in text."""
    
    entity_type: str
    text: str
    start: int
    end: int
    confidence: float
    replacement: Optional[str] = None


class PhiDetectionService:
    """
    Service for detecting and anonymizing PHI in clinical text.
    
    This service loads rules from a YAML file and applies them to
    detect various types of PHI (names, addresses, etc.) in text.
    It provides methods for anonymizing or redacting detected PHI
    to maintain HIPAA compliance.
    """
    
    def __init__(self, rules_path: str):
        """
        Initialize PHI detection service with rules.
        
        Args:
            rules_path: Path to YAML file containing PHI detection rules
        
        Raises:
            PHIDetectionError: If rules cannot be loaded
        """
        self.rules_path = rules_path
        self.rules = {}
        self.load_rules()
    
    def load_rules(self) -> None:
        """
        Load PHI detection rules from YAML file.
        
        Raises:
            PHIDetectionError: If rules cannot be loaded
        """
        try:
            path = Path(self.rules_path)
            if not path.exists():
                raise PHIDetectionError(f"Rules file not found: {self.rules_path}")
            
            with open(path, "r", encoding="utf-8") as f:
                self.rules = yaml.safe_load(f)
            
            # Compile regex patterns for performance
            self._compile_patterns()
            
            logger.info(f"Loaded PHI detection rules from {self.rules_path}")
            
        except (yaml.YAMLError, Exception) as e:
            logger.error(f"Failed to load PHI rules: {str(e)}")
            raise PHIDetectionError(f"Failed to load PHI rules: {str(e)}")
    
    def _compile_patterns(self) -> None:
        """Compile regex patterns for each rule."""
        for rule_name, rule_data in self.rules.items():
            if "patterns" in rule_data:
                compiled_patterns = []
                for pattern in rule_data["patterns"]:
                    try:
                        compiled_patterns.append(re.compile(pattern, re.IGNORECASE))
                    except re.error as e:
                        logger.warning(f"Invalid regex in {rule_name}: {pattern}, error: {str(e)}")
                
                self.rules[rule_name]["compiled_patterns"] = compiled_patterns
    
    async def detect_phi(
        self, 
        text: str, 
        anonymize_method: Optional[str] = None,
        confidence_threshold: float = 0.7
    ) -> Dict[str, Any]:
        """
        Detect PHI in text and optionally anonymize it.
        
        Args:
            text: Text to analyze for PHI
            anonymize_method: Method for anonymizing PHI ('redact' or 'replace')
            confidence_threshold: Minimum confidence score for PHI detection
            
        Returns:
            Dictionary with detection results and optionally anonymized text
            
        Raises:
            PHIDetectionError: If PHI detection fails
        """
        try:
            # Find all PHI matches in text
            matches = self._find_phi_matches(text, confidence_threshold)
            
            # Create result structure
            result = {
                "detection_id": str(uuid.uuid4()),
                "processed_at": datetime.datetime.now().isoformat(),
                "entities": [],
                "phi_count": len(matches)
            }
            
            # Handle anonymization if requested
            if anonymize_method and matches:
                anonymized_text, matches = self._anonymize_text(
                    text, matches, anonymize_method
                )
                result["anonymized_text"] = anonymized_text
            
            # Add entity information
            for match in matches:
                entity = {
                    "entity_type": match.entity_type,
                    "position": {"start": match.start, "end": match.end},
                    "confidence": match.confidence
                }
                
                # Only include original text if not anonymizing
                if not anonymize_method:
                    entity["text"] = match.text
                else:
                    entity["replacement"] = match.replacement
                
                result["entities"].append(entity)
            
            return result
            
        except Exception as e:
            logger.error(f"PHI detection error: {str(e)}")
            raise PHIDetectionError(f"PHI detection failed: {str(e)}")
    
    def _find_phi_matches(
        self, 
        text: str, 
        confidence_threshold: float
    ) -> List[PHIMatch]:
        """
        Find all PHI matches in text.
        
        Args:
            text: Text to analyze
            confidence_threshold: Minimum confidence score
            
        Returns:
            List of PHI matches
        """
        matches = []
        
        for rule_name, rule_data in self.rules.items():
            if "compiled_patterns" not in rule_data:
                continue
                
            confidence = rule_data.get("confidence", 0.5)
            if confidence < confidence_threshold:
                continue
                
            for pattern in rule_data["compiled_patterns"]:
                for match in pattern.finditer(text):
                    matches.append(PHIMatch(
                        entity_type=rule_name,
                        text=match.group(0),
                        start=match.start(),
                        end=match.end(),
                        confidence=confidence,
                        replacement=rule_data.get("replacement", f"[{rule_name}]")
                    ))
        
        # Sort matches by position for proper anonymization
        return sorted(matches, key=lambda m: m.start)
    
    def _anonymize_text(
        self, 
        text: str, 
        matches: List[PHIMatch],
        method: str
    ) -> Tuple[str, List[PHIMatch]]:
        """
        Anonymize PHI in text.
        
        Args:
            text: Original text
            matches: PHI matches to anonymize
            method: Anonymization method ('redact' or 'replace')
            
        Returns:
            Tuple of (anonymized text, updated matches)
        """
        if not matches:
            return text, matches
            
        # Make a copy of the original text
        anonymized = text
        
        # When replacing text, we need to adjust offsets for subsequent matches
        offset = 0
        updated_matches = []
        
        for match in matches:
            original_text = match.text
            start_idx = match.start + offset
            end_idx = match.end + offset
            
            if method == "redact":
                # Replace with [REDACTED]
                replacement = "[REDACTED]"
            else:
                # Use the rule's replacement or a generic placeholder
                replacement = match.replacement
            
            # Update the text
            anonymized = anonymized[:start_idx] + replacement + anonymized[end_idx:]
            
            # Update the match with new position info
            new_match = PHIMatch(
                entity_type=match.entity_type,
                text=original_text,
                start=start_idx,
                end=start_idx + len(replacement),
                confidence=match.confidence,
                replacement=replacement
            )
            updated_matches.append(new_match)
            
            # Update offset for subsequent replacements
            offset += len(replacement) - len(original_text)
        
        return anonymized, updated_matches