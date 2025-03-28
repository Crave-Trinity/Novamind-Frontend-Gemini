# -*- coding: utf-8 -*-
"""
MentaLLaMA Package.

This package provides services for interacting with the MentaLLaMA model.
"""

from app.infrastructure.ml.mentallama.service import (
    MentaLLaMAService,
    MentaLLaMAResult
)

__all__ = ["MentaLLaMAService", "MentaLLaMAResult"]