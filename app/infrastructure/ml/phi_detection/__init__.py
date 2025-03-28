# -*- coding: utf-8 -*-
"""
PHI Detection Module.

This module provides functionality for detecting and anonymizing
Protected Health Information (PHI) in clinical text for HIPAA compliance.
"""

from app.infrastructure.ml.phi_detection.service import PhiDetectionService

__all__ = ["PhiDetectionService"]