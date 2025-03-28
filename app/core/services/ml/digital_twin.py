# -*- coding: utf-8 -*-
"""
Digital Twin Service.

This module provides implementations of the Digital Twin service,
which represents an AI-driven simulated therapy assistant.
"""

import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Set, Union

from app.core.exceptions import (
    InvalidConfigurationError,
    InvalidRequestError,
    ModelNotFoundError,
    ServiceUnavailableError,
)
from app.core.services.ml.interface import DigitalTwinInterface
from app.core.utils.logging import get_logger


# Create logger (no PHI logging)
logger = get_logger(__name__)


class MockDigitalTwin(DigitalTwinInterface):
    """
    Mock Digital Twin Service.
    
    This class provides a mock implementation of the Digital Twin service for testing.
    It simulates responses to therapy sessions without using actual AI models.
    """
    
    def __init__(self) -> None:
        """Initialize MockDigitalTwin instance."""
        self._initialized = False
        self._config = None
        self._active_sessions = {}
        self._mock_responses = {
            "greeting": [
                "Hello! How are you feeling today?",
                "Welcome back. How have things been since we last spoke?",
                "It's good to see you. What's on your mind today?"
            ],
            "depression": [
                "I understand that you're feeling down. Would you like to talk more about what might be contributing to these feelings?",
                "Depression can be really challenging. Have you noticed any patterns to when these feelings are stronger?",
                "I'm sorry to hear you're feeling this way. What has helped you cope with similar feelings in the past?"
            ],
            "anxiety": [
                "It sounds like you're experiencing anxiety. What specific situations seem to trigger these feelings?",
                "Feeling anxious can be overwhelming. Have you tried any relaxation techniques that have helped before?",
                "I hear that you're feeling anxious. Let's explore some strategies that might help you manage these feelings."
            ],
            "general": [
                "Could you tell me more about that?",
                "How does that make you feel?",
                "That's interesting. What do you think it means?",
                "I'm listening. Please continue."
            ],
            "summary": [
                "Today we discussed your feelings of {topic}. We identified several triggers including {trigger1} and {trigger2}. For next steps, we talked about {strategy}.",
                "In our session, you shared about your experiences with {topic}. We explored the impact of {trigger1} on your wellbeing. We agreed you would try {strategy} before our next meeting.",
                "We focused on your recent challenges with {topic}. You mentioned {trigger1} has been particularly difficult. We discussed how {strategy} might help you cope better."
            ]
        }
        
    def initialize(self, config: Dict[str, Any]) -> None:
        """
        Initialize the service with configuration.
        
        Args:
            config: Configuration dictionary
            
        Raises:
            InvalidConfigurationError: If configuration is invalid
        """
        try:
            self._config = config or {}
            
            # Add custom mock responses if provided
            custom_responses = config.get("mock_responses", {})
            if custom_responses:
                for category, responses in custom_responses.items():
                    if category in self._mock_responses and isinstance(responses, list):
                        self._mock_responses[category].extend(responses)
            
            self._initialized = True
            logger.info("Mock Digital Twin service initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize mock Digital Twin service: {str(e)}")
            self._initialized = False
            self._config = None
            raise InvalidConfigurationError(f"Failed to initialize mock Digital Twin service: {str(e)}")
    
    def is_healthy(self) -> bool:
        """
        Check if the service is healthy.
        
        Returns:
            True if healthy, False otherwise
        """
        return self._initialized
    
    def shutdown(self) -> None:
        """Shutdown the service and release resources."""
        self._initialized = False
        self._config = None
        self._active_sessions = {}
        logger.info("Mock Digital Twin service shut down")
    
    def create_session(
        self,
        therapist_id: str,
        patient_id: Optional[str] = None,
        session_type: str = "therapy",
        session_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a new Digital Twin session.
        
        Args:
            therapist_id: ID of the therapist
            patient_id: ID of the patient (optional for anonymous sessions)
            session_type: Type of session (therapy, assessment, etc.)
            session_params: Additional session parameters
            
        Returns:
            Dict containing session information
            
        Raises:
            ServiceUnavailableError: If service is not initialized
            InvalidRequestError: If request is invalid
        """
        if not self._initialized:
            raise ServiceUnavailableError("Mock Digital Twin service is not initialized")
        
        if not therapist_id:
            raise InvalidRequestError("Therapist ID is required")
        
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Create session timestamp
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Initialize session
        session = {
            "session_id": session_id,
            "therapist_id": therapist_id,
            "patient_id": patient_id,
            "session_type": session_type,
            "created_at": timestamp,
            "updated_at": timestamp,
            "status": "active",
            "messages": [],
            "insights": [],
            "parameters": session_params or {}
        }
        
        # Store session
        self._active_sessions[session_id] = session
        
        # Create response
        response = {
            "session_id": session_id,
            "created_at": timestamp,
            "status": "active",
            "session_type": session_type
        }
        
        logger.info(f"Created mock Digital Twin session with ID {session_id}")
        
        return response
    
    def get_session(self, session_id: str) -> Dict[str, Any]:
        """
        Get information about a Digital Twin session.
        
        Args:
            session_id: ID of the session
            
        Returns:
            Dict containing session information
            
        Raises:
            ServiceUnavailableError: If service is not initialized
            InvalidRequestError: If session ID is invalid or not found
        """
        if not self._initialized:
            raise ServiceUnavailableError("Mock Digital Twin service is not initialized")
        
        if not session_id or not isinstance(session_id, str):
            raise InvalidRequestError("Session ID must be a non-empty string")
        
        # Get session
        session = self._active_sessions.get(session_id)
        if not session:
            raise InvalidRequestError(f"Session not found: {session_id}")
        
        # Create response (without messages content for privacy)
        response = {
            "session_id": session["session_id"],
            "therapist_id": session["therapist_id"],
            "patient_id": session["patient_id"],
            "session_type": session["session_type"],
            "created_at": session["created_at"],
            "updated_at": session["updated_at"],
            "status": session["status"],
            "message_count": len(session["messages"]),
            "insights_count": len(session["insights"])
        }
        
        return response
    
    def send_message(
        self,
        session_id: str,
        message: str,
        sender_type: str = "user",
        sender_id: Optional[str] = None,
        message_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Send a message to a Digital Twin session.
        
        Args:
            session_id: ID of the session
            message: Message content
            sender_type: Type of sender (user, therapist, system)
            sender_id: ID of the sender (optional)
            message_params: Additional message parameters
            
        Returns:
            Dict containing message information and Digital Twin's response
            
        Raises:
            ServiceUnavailableError: If service is not initialized
            InvalidRequestError: If request is invalid or session not found
        """
        if not self._initialized:
            raise ServiceUnavailableError("Mock Digital Twin service is not initialized")
        
        if not session_id or not isinstance(session_id, str):
            raise InvalidRequestError("Session ID must be a non-empty string")
            
        if not message or not isinstance(message, str):
            raise InvalidRequestError("Message must be a non-empty string")
        
        # Get session
        session = self._active_sessions.get(session_id)
        if not session:
            raise InvalidRequestError(f"Session not found: {session_id}")
        
        # Check if session is active
        if session["status"] != "active":
            raise InvalidRequestError(f"Session is not active: {session_id}")
        
        # Create timestamp
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Update session timestamp
        session["updated_at"] = timestamp
        
        # Create message object
        message_id = str(uuid.uuid4())
        message_obj = {
            "message_id": message_id,
            "session_id": session_id,
            "content": message,
            "sender_type": sender_type,
            "sender_id": sender_id,
            "timestamp": timestamp,
            "parameters": message_params or {}
        }
        
        # Add message to session
        session["messages"].append(message_obj)
        
        # Generate mock response based on message content
        response_content = self._generate_mock_response(message, session)
        
        # Create response message
        response_id = str(uuid.uuid4())
        response_timestamp = datetime.utcnow().isoformat() + "Z"
        response_obj = {
            "message_id": response_id,
            "session_id": session_id,
            "content": response_content,
            "sender_type": "digital_twin",
            "sender_id": None,
            "timestamp": response_timestamp,
            "parameters": {}
        }
        
        # Add response to session
        session["messages"].append(response_obj)
        
        # Create API response
        response = {
            "message_id": message_id,
            "timestamp": timestamp,
            "response": {
                "message_id": response_id,
                "content": response_content,
                "timestamp": response_timestamp
            }
        }
        
        return response
    
    def _generate_mock_response(self, message: str, session: Dict[str, Any]) -> str:
        """
        Generate a mock response based on message content.
        
        Args:
            message: User message
            session: Session information
            
        Returns:
            Generated response
        """
        import random
        
        # Check for greeting
        if len(session["messages"]) <= 2:
            return random.choice(self._mock_responses["greeting"])
        
        # Check for depression keywords
        depression_keywords = ["sad", "depressed", "depression", "hopeless", "worthless"]
        if any(keyword in message.lower() for keyword in depression_keywords):
            return random.choice(self._mock_responses["depression"])
        
        # Check for anxiety keywords
        anxiety_keywords = ["anxious", "anxiety", "worried", "panic", "nervous", "stress"]
        if any(keyword in message.lower() for keyword in anxiety_keywords):
            return random.choice(self._mock_responses["anxiety"])
        
        # Default to general response
        return random.choice(self._mock_responses["general"])
    
    def end_session(
        self,
        session_id: str,
        end_reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        End a Digital Twin session.
        
        Args:
            session_id: ID of the session
            end_reason: Reason for ending the session
            
        Returns:
            Dict containing session summary
            
        Raises:
            ServiceUnavailableError: If service is not initialized
            InvalidRequestError: If session ID is invalid or not found
        """
        if not self._initialized:
            raise ServiceUnavailableError("Mock Digital Twin service is not initialized")
        
        if not session_id or not isinstance(session_id, str):
            raise InvalidRequestError("Session ID must be a non-empty string")
        
        # Get session
        session = self._active_sessions.get(session_id)
        if not session:
            raise InvalidRequestError(f"Session not found: {session_id}")
        
        # Check if session is already ended
        if session["status"] == "ended":
            return {
                "session_id": session_id,
                "status": "ended",
                "end_reason": session.get("end_reason", "Unknown"),
                "ended_at": session.get("ended_at")
            }
        
        # Update session status
        session["status"] = "ended"
        session["end_reason"] = end_reason or "completed"
        session["ended_at"] = datetime.utcnow().isoformat() + "Z"
        
        # Generate session summary
        summary = self._generate_mock_summary(session)
        
        # Add summary to session
        session["summary"] = summary
        
        # Create response
        response = {
            "session_id": session_id,
            "status": "ended",
            "end_reason": session["end_reason"],
            "ended_at": session["ended_at"],
            "summary": summary
        }
        
        return response
    
    def _generate_mock_summary(self, session: Dict[str, Any]) -> str:
        """
        Generate a mock session summary.
        
        Args:
            session: Session information
            
        Returns:
            Generated summary
        """
        import random
        
        # Determine main topic from messages
        topics = []
        triggers = []
        strategies = ["mindfulness practice", "cognitive reframing", "breathing exercises", 
                     "journaling", "scheduled self-care", "boundary setting"]
        
        # Analyze messages
        for msg in session["messages"]:
            if msg["sender_type"] != "digital_twin":
                content = msg["content"].lower()
                
                if any(keyword in content for keyword in ["sad", "depressed", "depression", "hopeless"]):
                    topics.append("depression")
                    
                if any(keyword in content for keyword in ["anxious", "anxiety", "worried", "panic"]):
                    topics.append("anxiety")
                    
                if any(keyword in content for keyword in ["relationship", "partner", "spouse", "marriage"]):
                    topics.append("relationship issues")
                    triggers.append("communication problems")
                    
                if any(keyword in content for keyword in ["work", "job", "career", "boss", "coworker"]):
                    topics.append("work stress")
                    triggers.append("workplace demands")
                    
                if any(keyword in content for keyword in ["family", "parent", "child", "mother", "father"]):
                    topics.append("family concerns")
                    triggers.append("family dynamics")
                    
                if any(keyword in content for keyword in ["sleep", "insomnia", "tired", "exhausted"]):
                    topics.append("sleep issues")
                    triggers.append("disrupted sleep patterns")
        
        # Get unique topics and triggers
        unique_topics = list(set(topics))
        unique_triggers = list(set(triggers))
        
        # Default topics if none detected
        if not unique_topics:
            unique_topics = ["emotional wellbeing"]
        
        # Default triggers if none detected
        if len(unique_triggers) < 2:
            if len(unique_triggers) == 0:
                unique_triggers = ["daily stressors", "negative thought patterns"]
            else:
                unique_triggers.append("negative thought patterns")
        
        # Pick topic and triggers
        main_topic = random.choice(unique_topics)
        trigger1 = unique_triggers[0]
        trigger2 = unique_triggers[1] if len(unique_triggers) > 1 else "emotional reactions"
        strategy = random.choice(strategies)
        
        # Choose summary template
        template = random.choice(self._mock_responses["summary"])
        
        # Format summary
        summary = template.format(topic=main_topic, trigger1=trigger1, trigger2=trigger2, strategy=strategy)
        
        return summary
    
    def get_insights(
        self,
        session_id: str,
        insight_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get insights from a Digital Twin session.
        
        Args:
            session_id: ID of the session
            insight_type: Type of insights to retrieve
            
        Returns:
            Dict containing insights
            
        Raises:
            ServiceUnavailableError: If service is not initialized
            InvalidRequestError: If session ID is invalid or not found
        """
        if not self._initialized:
            raise ServiceUnavailableError("Mock Digital Twin service is not initialized")
        
        if not session_id or not isinstance(session_id, str):
            raise InvalidRequestError("Session ID must be a non-empty string")
        
        # Get session
        session = self._active_sessions.get(session_id)
        if not session:
            raise InvalidRequestError(f"Session not found: {session_id}")
        
        # Generate insights on demand
        insights = self._generate_mock_insights(session, insight_type)
        
        # Create response
        response = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "insights": insights
        }
        
        return response
    
    def _generate_mock_insights(
        self,
        session: Dict[str, Any],
        insight_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate mock insights from session.
        
        Args:
            session: Session information
            insight_type: Type of insights to generate
            
        Returns:
            List of insights
        """
        insights = []
        
        # Determine types to generate
        types_to_generate = []
        if insight_type:
            types_to_generate = [insight_type]
        else:
            # Generate all types
            types_to_generate = ["themes", "sentiment", "language_patterns", "recommendations"]
        
        # Generate insights for each type
        for insight_type in types_to_generate:
            if insight_type == "themes":
                themes = self._generate_mock_themes(session)
                if themes:
                    insights.append({
                        "type": "themes",
                        "data": themes,
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    })
            
            elif insight_type == "sentiment":
                sentiment = self._generate_mock_sentiment(session)
                if sentiment:
                    insights.append({
                        "type": "sentiment",
                        "data": sentiment,
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    })
            
            elif insight_type == "language_patterns":
                patterns = self._generate_mock_language_patterns(session)
                if patterns:
                    insights.append({
                        "type": "language_patterns",
                        "data": patterns,
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    })
            
            elif insight_type == "recommendations":
                recommendations = self._generate_mock_recommendations(session)
                if recommendations:
                    insights.append({
                        "type": "recommendations",
                        "data": recommendations,
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    })
        
        return insights
    
    def _generate_mock_themes(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock themes insights."""
        import random
        
        # Potential themes
        potential_themes = [
            {"name": "Anxiety", "confidence": 0.8, "description": "Expressions of worry, stress, or fear"},
            {"name": "Depression", "confidence": 0.75, "description": "Expressions of sadness, hopelessness, or lack of motivation"},
            {"name": "Relationships", "confidence": 0.7, "description": "Discussion of interpersonal connections and challenges"},
            {"name": "Work Stress", "confidence": 0.85, "description": "Discussion of workplace challenges and pressure"},
            {"name": "Self-Worth", "confidence": 0.65, "description": "Expressions related to self-esteem and self-image"},
            {"name": "Health Concerns", "confidence": 0.6, "description": "Discussion of physical or mental health issues"},
            {"name": "Life Transitions", "confidence": 0.7, "description": "Discussion of changes and adjustments in life circumstances"}
        ]
        
        # Select 2-4 themes
        num_themes = random.randint(2, 4)
        selected_themes = random.sample(potential_themes, num_themes)
        
        # Adjust confidence slightly for randomness
        for theme in selected_themes:
            theme["confidence"] += random.uniform(-0.1, 0.1)
            theme["confidence"] = max(0.5, min(0.95, theme["confidence"]))  # Keep between 0.5 and 0.95
            theme["confidence"] = round(theme["confidence"], 2)
        
        # Sort by confidence
        selected_themes.sort(key=lambda x: x["confidence"], reverse=True)
        
        return {
            "primary_themes": selected_themes
        }
    
    def _generate_mock_sentiment(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock sentiment insights."""
        import random
        
        # Generate overall sentiment
        overall = random.uniform(-0.5, 0.5)  # Between -0.5 and 0.5
        overall = round(overall, 2)
        
        # Generate sentiment progression
        progression = []
        current = overall - random.uniform(0.1, 0.3)
        
        for i in range(5):
            current += random.uniform(-0.2, 0.3)
            current = max(-1.0, min(1.0, current))  # Keep between -1 and 1
            progression.append(round(current, 2))
        
        # Generate emotions
        emotions = {
            "joy": round(random.uniform(0, 0.5), 2),
            "sadness": round(random.uniform(0, 0.7), 2),
            "anger": round(random.uniform(0, 0.4), 2),
            "fear": round(random.uniform(0, 0.6), 2),
            "surprise": round(random.uniform(0, 0.3), 2)
        }
        
        return {
            "overall": overall,
            "progression": progression,
            "emotions": emotions
        }
    
    def _generate_mock_language_patterns(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock language pattern insights."""
        return {
            "absolutist_terms": {
                "frequency": round(random.uniform(0.05, 0.2), 2),
                "examples": ["always", "never", "completely", "totally"]
            },
            "negative_self_references": {
                "frequency": round(random.uniform(0.1, 0.3), 2),
                "examples": ["I can't", "I'm not good enough", "I always fail"]
            },
            "cognitive_distortions": [
                {
                    "type": "Catastrophizing",
                    "frequency": round(random.uniform(0.1, 0.4), 2),
                    "description": "Assuming the worst possible outcome"
                },
                {
                    "type": "Black and white thinking",
                    "frequency": round(random.uniform(0.1, 0.3), 2),
                    "description": "Viewing situations in extreme, all-or-nothing terms"
                }
            ]
        }
    
    def _generate_mock_recommendations(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock recommendations insights."""
        return {
            "therapeutic_approaches": [
                {
                    "name": "Cognitive Behavioral Therapy",
                    "relevance": round(random.uniform(0.7, 0.9), 2),
                    "description": "Focusing on identifying and challenging negative thought patterns"
                },
                {
                    "name": "Mindfulness Practices",
                    "relevance": round(random.uniform(0.6, 0.8), 2),
                    "description": "Incorporating present-moment awareness techniques"
                }
            ],
            "discussion_topics": [
                "Exploring sources of anxiety in work environment",
                "Developing self-compassion practices",
                "Building communication strategies for difficult conversations"
            ],
            "resources": [
                {
                    "type": "Reading",
                    "title": "The Anxiety and Phobia Workbook",
                    "author": "Edmund J. Bourne"
                },
                {
                    "type": "Exercise",
                    "title": "Progressive Muscle Relaxation",
                    "description": "A technique to reduce physical tension"
                }
            ]
        }


class OpenAIDigitalTwin(DigitalTwinInterface):
    """
    OpenAI-based Digital Twin Service.
    
    This class provides an implementation of the Digital Twin service
    using OpenAI's models for realistic and effective therapy assistance.
    """
    
    def __init__(self) -> None:
        """Initialize OpenAIDigitalTwin instance."""
        self._initialized = False
        self._config = None
        self._active_sessions = {}
        self._api_key = None
        self._organization_id = None
        self._base_url = None
        self._default_model = "gpt-4"
        self._system_prompts = {}
        
        # Import OpenAI client lazily to avoid dependency issues
        try:
            import openai
            self._openai_available = True
        except ImportError:
            self._openai_available = False
            logger.warning("OpenAI package not installed. Install with: pip install openai>=1.0.0")
    
    def initialize(self, config: Dict[str, Any]) -> None:
        """
        Initialize the service with configuration.
        
        Args:
            config: Configuration dictionary
            
        Raises:
            InvalidConfigurationError: If configuration is invalid
        """
        try:
            if not self._openai_available:
                raise InvalidConfigurationError("OpenAI package not installed. Install with: pip install openai>=1.0.0")
            
            self._config = config or {}
            
            # Get OpenAI API configuration
            self._api_key = self._get_config_value("api_key")
            if not self._api_key:
                raise InvalidConfigurationError("OpenAI API key is required")
            
            # Get optional configuration
            self._organization_id = self._get_config_value("organization_id")
            self._base_url = self._get_config_value("base_url")
            self._default_model = self._get_config_value("default_model") or "gpt-4"
            
            # Load system prompts
            self._load_system_prompts()
            
            # Initialize OpenAI client
            import openai
            client_kwargs = {"api_key": self._api_key}
            
            if self._organization_id:
                client_kwargs["organization"] = self._organization_id
                
            if self._base_url:
                client_kwargs["base_url"] = self._base_url
                
            self._client = openai.OpenAI(**client_kwargs)
            
            # Verify API key
            self._check_api_key()
            
            self._initialized = True
            logger.info("OpenAI Digital Twin service initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI Digital Twin service: {str(e)}")
            self._initialized = False
            self._config = None
            self._client = None
            raise InvalidConfigurationError(f"Failed to initialize OpenAI Digital Twin service: {str(e)}")
    
    def _get_config_value(self, key: str) -> Optional[str]:
        """
        Get configuration value from config or environment variable.
        
        Args:
            key: Configuration key
            
        Returns:
            Configuration value or None if not found
        """
        import os
        
        # Try to get from config
        value = self._config.get(key)
        if value:
            return value
        
        # Try to get from environment
        env_key = f"OPENAI_{key.upper()}"
        return os.environ.get(env_key)
    
    def _load_system_prompts(self) -> None:
        """Load system prompts for different session types."""
        # Get custom prompts from config
        custom_prompts = self._config.get("system_prompts", {})
        
        # Default prompts
        default_prompts = {
            "therapy": """You are TherapistGPT, a supportive, empathetic, and ethically-grounded AI therapy assistant. Your purpose is to assist human therapists in their clinical practice. As a therapy assistant, you follow these guidelines:

1. RESPOND AS A THERAPIST ASSISTANT: You help therapists in their practice by providing thoughtful, evidence-informed responses that reflect the principles of good therapy.

2. CLINICAL APPROACH: You primarily draw from evidence-based modalities such as Cognitive Behavioral Therapy (CBT), Acceptance and Commitment Therapy (ACT), and Solution-Focused Brief Therapy, while maintaining a humanistic, client-centered foundation.

3. THERAPEUTIC ALLIANCE: Demonstrate empathy, unconditional positive regard, and authenticity. Validate emotions and experiences while maintaining appropriate boundaries.

4. ETHICAL PRIORITIES: Your primary ethical obligation is to promote wellbeing and do no harm. Maintain confidentiality and privacy of all conversation details.

5. LIMITATIONS: You acknowledge that you're an AI assistant, not a licensed mental health professional. Your purpose is to assist the therapy process, not replace professional help.

6. CRISIS PROTOCOL: If there are concerns about safety or harm, remind users to contact emergency services, crisis lines, or their healthcare provider.

For any session, maintain a professional, warm, and supportive tone. Focus on understanding the client's experience, collaborating on their goals, and assisting with evidence-based therapeutic techniques when appropriate.

Remember that successful therapy is built on trust, understanding, and a collaborative relationship. Your role is to support this process with the human therapist.""",

            "assessment": """You are AssessmentGPT, a professional AI assistant focused on mental health assessments. Your purpose is to help practitioners gather relevant clinical information in a structured, empathetic manner. As an assessment assistant, you follow these guidelines:

1. RESPOND AS AN ASSESSMENT ASSISTANT: Help gather clinically relevant information through thoughtful, structured questions that follow professional assessment protocols.

2. CLINICAL APPROACH: Use evidence-based assessment frameworks, focusing on gathering information about symptoms, history, functioning, and risk factors in a systematic way.

3. PROFESSIONAL TONE: Maintain a professional but warm tone, explaining the purpose of questions and acknowledging the sensitivity of information being shared.

4. ETHICAL PRIORITIES: Prioritize the ethical collection of information, ensuring questions are clinically necessary and asked in a trauma-informed manner.

5. LIMITATIONS: Acknowledge that you're an AI assistant, not replacing clinical judgment. Your role is to help gather information that a mental health professional will evaluate.

6. RISK ASSESSMENT: If risk factors emerge, gather appropriate information while reminding users to contact emergency services or their provider if immediate concerns exist.

For assessment interactions, focus on clear, concise questions that help build a comprehensive clinical picture while maintaining sensitivity to the client's experience.""",

            "coaching": """You are CoachGPT, a supportive AI coaching assistant focused on personal growth and positive change. Your purpose is to assist with goal-setting, skill-building, and wellness promotion. As a coaching assistant, you follow these guidelines:

1. RESPOND AS A COACHING ASSISTANT: Help clients identify goals, develop action plans, and stay accountable through a strengths-based, solution-focused approach.

2. COACHING APPROACH: Draw from positive psychology, motivational interviewing, and evidence-based coaching methodologies, focusing on building skills and leveraging strengths.

3. COLLABORATIVE STANCE: Maintain a collaborative, encouraging tone that empowers clients to develop their own solutions while providing structure and accountability.

4. ETHICAL PRIORITIES: Focus on appropriate coaching topics (personal growth, skill development, wellness) and recognize when issues might require professional mental health support.

5. LIMITATIONS: Acknowledge that you're an AI assistant, not replacing professional coaches or mental health providers. Your role is to support the coaching process.

6. BOUNDARIES: Maintain clear boundaries around the coaching relationship, focusing on present-focused growth rather than processing past trauma or treating clinical conditions.

For coaching interactions, focus on helping clients clarify their values and goals, develop specific action steps, identify potential obstacles, and create accountability systems."""
        }
        
        # Merge default and custom prompts
        self._system_prompts = default_prompts.copy()
        self._system_prompts.update(custom_prompts)
    
    def _check_api_key(self) -> None:
        """
        Check if the API key is valid.
        
        Raises:
            InvalidConfigurationError: If API key is invalid
        """
        try:
            # Test API connection with a minimal request
            self._client.models.list(limit=1)
        except Exception as e:
            logger.error(f"Failed to connect to OpenAI API: {str(e)}")
            raise InvalidConfigurationError(f"Failed to connect to OpenAI API: {str(e)}")
    
    def is_healthy(self) -> bool:
        """
        Check if the service is healthy.
        
        Returns:
            True if healthy, False otherwise
        """
        if not self._initialized or not self._client:
            return False
            
        try:
            # Test API connection
            self._client.models.list(limit=1)
            return True
        except Exception:
            return False
    
    def shutdown(self) -> None:
        """Shutdown the service and release resources."""
        self._initialized = False
        self._config = None
        self._active_sessions = {}
        self._client = None
        logger.info("OpenAI Digital Twin service shut down")
    
    def create_session(
        self,
        therapist_id: str,
        patient_id: Optional[str] = None,
        session_type: str = "therapy",
        session_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a new Digital Twin session.
        
        Args:
            therapist_id: ID of the therapist
            patient_id: ID of the patient (optional for anonymous sessions)
            session_type: Type of session (therapy, assessment, etc.)
            session_params: Additional session parameters
            
        Returns:
            Dict containing session information
            
        Raises:
            ServiceUnavailableError: If service is not initialized
            InvalidRequestError: If request is invalid
        """
        if not self._initialized:
            raise ServiceUnavailableError("OpenAI Digital Twin service is not initialized")
        
        if not therapist_id:
            raise InvalidRequestError("Therapist ID is required")
        
        # Get session parameters
        params = session_params or {}
        
        # Get model to use
        model = params.get("model") or self._default_model
        
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Create session timestamp
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Get system prompt for session type
        system_prompt = self._get_system_prompt(session_type)
        
        # Initialize session
        session = {
            "session_id": session_id,
            "therapist_id": therapist_id,
            "patient_id": patient_id,
            "session_type": session_type,
            "created_at": timestamp,
            "updated_at": timestamp,
            "status": "active",
            "model": model,
            "system_prompt": system_prompt,
            "messages": [
                {"role": "system", "content": system_prompt}
            ],
            "insights": [],
            "parameters": params
        }
        
        # Store session
        self._active_sessions[session_id] = session
        
        # Create response
        response = {
            "session_id": session_id,
            "created_at": timestamp,
            "status": "active",
            "session_type": session_type,
            "model": model
        }
        
        logger.info(f"Created OpenAI Digital Twin session with ID {session_id}")
        
        return response
    
    def _get_system_prompt(self, session_type: str) -> str:
        """
        Get system prompt for session type.
        
        Args:
            session_type: Type of session
            
        Returns:
            System prompt
        """
        # Get system prompt for session type
        prompt = self._system_prompts.get(session_type)
        
        # Default to therapy prompt if not found
        if not prompt:
            prompt = self._system_prompts.get("therapy")
            
        return prompt
    
    def get_session(self, session_id: str) -> Dict[str, Any]:
        """
        Get information about a Digital Twin session.
        
        Args:
            session_id: ID of the session
            
        Returns:
            Dict containing session information
            
        Raises:
            ServiceUnavailableError: If service is not initialized
            InvalidRequestError: If session ID is invalid or not found
        """
        if not self._initialized:
            raise ServiceUnavailableError("OpenAI Digital Twin service is not initialized")
        
        if not session_id or not isinstance(session_id, str):
            raise InvalidRequestError("Session ID must be a non-empty string")
        
        # Get session
        session = self._active_sessions.get(session_id)
        if not session:
            raise InvalidRequestError(f"Session not found: {session_id}")
        
        # Create response (without messages content for privacy)
        response = {
            "session_id": session["session_id"],
            "therapist_id": session["therapist_id"],
            "patient_id": session["patient_id"],
            "session_type": session["session_type"],
            "created_at": session["created_at"],
            "updated_at": session["updated_at"],
            "status": session["status"],
            "model": session["model"],
            "message_count": len(session["messages"]) - 1,  # Subtract system message
            "insights_count": len(session["insights"])
        }
        
        return response
    
    def send_message(
        self,
        session_id: str,
        message: str,
        sender_type: str = "user",
        sender_id: Optional[str] = None,
        message_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Send a message to a Digital Twin session.
        
        Args:
            session_id: ID of the session
            message: Message content
            sender_type: Type of sender (user, therapist, system)
            sender_id: ID of the sender (optional)
            message_params: Additional message parameters
            
        Returns:
            Dict containing message information and Digital Twin's response
            
        Raises:
            ServiceUnavailableError: If service is not initialized
            InvalidRequestError: If request is invalid or session not found
        """
        if not self._initialized:
            raise ServiceUnavailableError("OpenAI Digital Twin service is not initialized")
        
        if not session_id or not isinstance(session_id, str):
            raise InvalidRequestError("Session ID must be a non-empty string")
            
        if not message or not isinstance(message, str):
            raise InvalidRequestError("Message must be a non-empty string")
        
        # Get session
        session = self._active_sessions.get(session_id)
        if not session:
            raise InvalidRequestError(f"Session not found: {session_id}")
        
        # Check if session is active
        if session["status"] != "active":
            raise InvalidRequestError(f"Session is not active: {session_id}")
        
        # Create timestamp
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Update session timestamp
        session["updated_at"] = timestamp
        
        # Create message object
        message_id = str(uuid.uuid4())
        message_obj = {
            "message_id": message_id,
            "session_id": session_id,
            "content": message,
            "sender_type": sender_type,
            "sender_id": sender_id,
            "timestamp": timestamp,
            "parameters": message_params or {}
        }
        
        # Map sender type to OpenAI role
        role_map = {
            "user": "user",
            "therapist": "user",
            "system": "system",
            "digital_twin": "assistant"
        }
        
        # Default to user if role not found
        openai_role = role_map.get(sender_type, "user")
        
        # Add message to chat history
        session["messages"].append({"role": openai_role, "content": message})
        
        # Generate response
        response_content = self._generate_openai_response(session)
        
        # Create response message
        response_id = str(uuid.uuid4())
        response_timestamp = datetime.utcnow().isoformat() + "Z"
        response_obj = {
            "message_id": response_id,
            "session_id": session_id,
            "content": response_content,
            "sender_type": "digital_twin",
            "sender_id": None,
            "timestamp": response_timestamp,
            "parameters": {}
        }
        
        # Add user message and response to session history
        session["messages"].append({"role": "assistant", "content": response_content})
        
        # Create API response
        response = {
            "message_id": message_id,
            "timestamp": timestamp,
            "response": {
                "message_id": response_id,
                "content": response_content,
                "timestamp": response_timestamp
            }
        }
        
        return response
    
    def _generate_openai_response(self, session: Dict[str, Any]) -> str:
        """
        Generate a response using OpenAI.
        
        Args:
            session: Session information
            
        Returns:
            Generated response
            
        Raises:
            ServiceUnavailableError: If OpenAI API call fails
        """
        try:
            # Get model
            model = session.get("model", self._default_model)
            
            # Get messages
            messages = session["messages"]
            
            # Generate completion
            response = self._client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            # Extract response text
            content = response.choices[0].message.content
            
            return content
            
        except Exception as e:
            logger.error(f"Failed to generate OpenAI response: {str(e)}")
            raise ServiceUnavailableError(f"Failed to generate response: {str(e)}")
    
    def end_session(
        self,
        session_id: str,
        end_reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        End a Digital Twin session.
        
        Args:
            session_id: ID of the session
            end_reason: Reason for ending the session
            
        Returns:
            Dict containing session summary
            
        Raises:
            ServiceUnavailableError: If service is not initialized
            InvalidRequestError: If session ID is invalid or not found
        """
        if not self._initialized:
            raise ServiceUnavailableError("OpenAI Digital Twin service is not initialized")
        
        if not session_id or not isinstance(session_id, str):
            raise InvalidRequestError("Session ID must be a non-empty string")
        
        # Get session
        session = self._active_sessions.get(session_id)
        if not session:
            raise InvalidRequestError(f"Session not found: {session_id}")
        
        # Check if session is already ended
        if session["status"] == "ended":
            return {
                "session_id": session_id,
                "status": "ended",
                "end_reason": session.get("end_reason", "Unknown"),
                "ended_at": session.get("ended_at")
            }
        
        # Update session status
        session["status"] = "ended"
        session["end_reason"] = end_reason or "completed"
        session["ended_at"] = datetime.utcnow().isoformat() + "Z"
        
        # Generate session summary
        summary = self._generate_openai_summary(session)
        
        # Add summary to session
        session["summary"] = summary
        
        # Create response
        response = {
            "session_id": session_id,
            "status": "ended",
            "end_reason": session["end_reason"],
            "ended_at": session["ended_at"],
            "summary": summary
        }
        
        return response
    
    def _generate_openai_summary(self, session: Dict[str, Any]) -> str:
        """
        Generate a session summary using OpenAI.
        
        Args:
            session: Session information
            
        Returns:
            Generated summary
            
        Raises:
            ServiceUnavailableError: If OpenAI API call fails
        """
        try:
            # Get model
            model = session.get("model", self._default_model)
            
            # Create prompt for summary
            summary_prompt = """Please provide a concise summary of this therapy session. Include:
1. Main themes and topics discussed
2. Key insights or breakthroughs
3. Recommended action items or homework
4. Suggested topics for follow-up

Keep the summary professional, empathetic, and focused on the most clinically relevant information. Do not include specific personal details that are not directly relevant to the therapeutic process."""
            
            # Get messages (excluding system message to save tokens)
            messages = [
                {"role": "system", "content": summary_prompt}
            ]
            
            # Add relevant messages from session
            # Add at most 10 most recent exchanges to avoid token limits
            session_messages = session["messages"][1:]  # Skip system message
            session_messages = session_messages[-20:]  # Get most recent messages
            
            # Convert messages to a single context document
            context = "Session Transcript:\n\n"
            for i, msg in enumerate(session_messages):
                role = "Client" if msg["role"] == "user" else "Therapist"
                context += f"{role}: {msg['content']}\n\n"
            
            messages.append({"role": "user", "content": context})
            
            # Generate completion
            response = self._client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            # Extract response text
            summary = response.choices[0].message.content
            
            return summary
            
        except Exception as e:
            logger.error(f"Failed to generate OpenAI summary: {str(e)}")
            # Return a basic summary if OpenAI fails
            return "Session summary could not be generated due to a technical issue."
    
    def get_insights(
        self,
        session_id: str,
        insight_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get insights from a Digital Twin session.
        
        Args:
            session_id: ID of the session
            insight_type: Type of insights to retrieve
            
        Returns:
            Dict containing insights
            
        Raises:
            ServiceUnavailableError: If service is not initialized
            InvalidRequestError: If session ID is invalid or not found
        """
        if not self._initialized:
            raise ServiceUnavailableError("OpenAI Digital Twin service is not initialized")
        
        if not session_id or not isinstance(session_id, str):
            raise InvalidRequestError("Session ID must be a non-empty string")
        
        # Get session
        session = self._active_sessions.get(session_id)
        if not session:
            raise InvalidRequestError(f"Session not found: {session_id}")
        
        # Generate insights on demand
        insights = self._generate_openai_insights(session, insight_type)
        
        # Create response
        response = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "insights": insights
        }
        
        return response
    
    def _generate_openai_insights(
        self,
        session: Dict[str, Any],
        insight_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate insights using OpenAI.
        
        Args:
            session: Session information
            insight_type: Type of insights to generate
            
        Returns:
            List of insights
            
        Raises:
            ServiceUnavailableError: If OpenAI API call fails
        """
        try:
            # Determine types to generate
            types_to_generate = []
            if insight_type:
                types_to_generate = [insight_type]
            else:
                # Generate all types
                types_to_generate = ["themes", "sentiment", "language_patterns", "recommendations"]
            
            insights = []
            
            # Get model
            model = session.get("model", self._default_model)
            
            # Get messages (excluding system message to save tokens)
            session_messages = session["messages"][1:]  # Skip system message
            session_messages = session_messages[-20:]  # Get most recent messages
            
            # Convert messages to a single context document
            context = "Session Transcript:\n\n"
            for i, msg in enumerate(session_messages):
                role = "Client" if msg["role"] == "user" else "Therapist"
                context += f"{role}: {msg['content']}\n\n"
            
            # Generate insights for each type
            for insight_type in types_to_generate:
                # Get prompt for insight type
                prompt = self._get_insight_prompt(insight_type)
                
                # Create messages
                messages = [
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": context}
                ]
                
                # Generate completion
                response = self._client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1000,
                    response_format={"type": "json_object"}
                )
                
                # Extract response text
                content = response.choices[0].message.content
                
                # Parse JSON response
                try:
                    data = json.loads(content)
                    
                    insights.append({
                        "type": insight_type,
                        "data": data,
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    })
                    
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse JSON response for insight type {insight_type}")
            
            return insights
            
        except Exception as e:
            logger.error(f"Failed to generate OpenAI insights: {str(e)}")
            # Return a minimal insight if OpenAI fails
            return [{
                "type": "error",
                "data": {"message": "Insights could not be generated due to a technical issue."},
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }]
    
    def _get_insight_prompt(self, insight_type: str) -> str:
        """
        Get prompt for insight type.
        
        Args:
            insight_type: Type of insight
            
        Returns:
            Prompt for generating insight
        """
        prompts = {
            "themes": """You are an AI trained to analyze therapy sessions and identify key themes. Please analyze the following session transcript and identify the primary themes discussed. 

Provide your analysis in JSON format with the following structure:
{
    "primary_themes": [
        {
            "name": "theme name",
            "confidence": float between 0 and 1,
            "description": "brief description of theme"
        }
    ]
}

Identify 2-5 main themes, focusing on clinically relevant patterns rather than specific details. Confidence should reflect how clearly the theme was expressed.""",

            "sentiment": """You are an AI trained to analyze the emotional content of therapy sessions. Please analyze the following session transcript and provide sentiment analysis.

Provide your analysis in JSON format with the following structure:
{
    "overall": float between -1 and 1,
    "progression": [list of 5 sentiment values showing change over session],
    "emotions": {
        "joy": float between 0 and 1,
        "sadness": float between 0 and 1,
        "anger": float between 0 and 1,
        "fear": float between 0 and 1,
        "surprise": float between 0 and 1
    }
}

Overall sentiment should range from -1 (very negative) to 1 (very positive). Emotion values should represent the intensity of each emotion observed.""",

            "language_patterns": """You are an AI trained to analyze linguistic patterns in therapy sessions that might indicate cognitive patterns or therapeutic opportunities. Please analyze the following session transcript.

Provide your analysis in JSON format with the following structure:
{
    "absolutist_terms": {
        "frequency": float between 0 and 1,
        "examples": [list of examples from transcript]
    },
    "negative_self_references": {
        "frequency": float between 0 and 1,
        "examples": [list of examples from transcript]
    },
    "cognitive_distortions": [
        {
            "type": "name of distortion",
            "frequency": float between 0 and 1,
            "description": "brief description"
        }
    ]
}

Focus on patterns that may be clinically relevant but do not include specific personal details.""",

            "recommendations": """You are an AI trained to analyze therapy sessions and provide therapeutic recommendations. Please analyze the following session transcript and suggest therapeutic approaches and discussion topics.

Provide your analysis in JSON format with the following structure:
{
    "therapeutic_approaches": [
        {
            "name": "approach name",
            "relevance": float between 0 and 1,
            "description": "brief description of how it applies"
        }
    ],
    "discussion_topics": [
        "suggested topic 1",
        "suggested topic 2",
        "suggested topic 3"
    ],
    "resources": [
        {
            "type": "type of resource",
            "title": "title of resource",
            "author": "author (if applicable)",
            "description": "brief description (if applicable)"
        }
    ]
}

Focus on evidence-based therapeutic approaches and resources that would be appropriate for a professional mental health context."""
        }
        
        return prompts.get(insight_type, prompts["themes"])