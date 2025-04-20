/* eslint-disable */
/**
 * Analytics service for tracking user interactions
 */

/**
 * Analytics event interface
 */
export interface AnalyticsEvent {
  eventName: string;
  eventType: 'page_view' | 'user_action' | 'error' | 'performance';
  timestamp: number;
  userId?: string;
  sessionId?: string;
  properties: Record<string, unknown>;
}

/**
 * Analytics provider interface
 */
export interface AnalyticsProvider {
  initialize(options: Record<string, unknown>): Promise<void>;
  trackEvent(event: AnalyticsEvent): Promise<void>;
  trackPageView(pageName: string, properties?: Record<string, unknown>): Promise<void>;
  trackError(error: Error, properties?: Record<string, unknown>): Promise<void>;
  setUserProperties(userId: string, properties: Record<string, unknown>): Promise<void>;
}

/**
 * Mock analytics provider for development
 */
export class MockAnalyticsProvider implements AnalyticsProvider {
  private isInitialized = false;
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}`;
  }

  async initialize(options: Record<string, unknown>): Promise<void> {
    console.log('Initializing mock analytics provider with options:', options);
    this.isInitialized = true;
  }

  private checkInitialized(): void {
    if (!this.isInitialized) {
      console.warn('Analytics provider not initialized');
    }
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    this.checkInitialized();
    console.log('Analytics event:', {
      ...event,
      sessionId: event.sessionId || this.sessionId,
      timestamp: event.timestamp || Date.now(),
    });
  }

  async trackPageView(pageName: string, properties: Record<string, unknown> = {}): Promise<void> {
    this.checkInitialized();
    await this.trackEvent({
      eventName: 'page_view',
      eventType: 'page_view',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      properties: {
        page: pageName,
        ...properties,
      },
    });
  }

  async trackError(error: Error, properties: Record<string, unknown> = {}): Promise<void> {
    this.checkInitialized();
    await this.trackEvent({
      eventName: 'error',
      eventType: 'error',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      properties: {
        errorMessage: error.message,
        errorStack: error.stack,
        ...properties,
      },
    });
  }

  async setUserProperties(userId: string, properties: Record<string, unknown>): Promise<void> {
    this.checkInitialized();
    console.log('Setting user properties:', {
      userId,
      properties,
    });
  }
}

/**
 * Analytics service that aggregates multiple providers
 */
export class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private userId?: string;
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}`;

    // Add default provider in development
    if (process.env.NODE_ENV === 'development') {
      this.providers.push(new MockAnalyticsProvider());
    }
  }

  /**
   * Add a new analytics provider
   */
  addProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider);
  }

  /**
   * Initialize all providers
   */
  async initialize(options: Record<string, unknown> = {}): Promise<void> {
    for (const provider of this.providers) {
      await provider.initialize(options);
    }
  }

  /**
   * Set the current user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Track a custom event
   */
  async trackEvent(
    eventName: string,
    eventType: AnalyticsEvent['eventType'],
    properties: Record<string, unknown> = {}
  ): Promise<void> {
    const event: AnalyticsEvent = {
      eventName,
      eventType,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties,
    };

    for (const provider of this.providers) {
      await provider.trackEvent(event);
    }
  }

  /**
   * Track a page view
   */
  async trackPageView(pageName: string, properties: Record<string, unknown> = {}): Promise<void> {
    for (const provider of this.providers) {
      await provider.trackPageView(pageName, {
        userId: this.userId,
        sessionId: this.sessionId,
        ...properties,
      });
    }
  }

  /**
   * Track an error
   */
  async trackError(error: Error, properties: Record<string, unknown> = {}): Promise<void> {
    for (const provider of this.providers) {
      await provider.trackError(error, {
        userId: this.userId,
        sessionId: this.sessionId,
        ...properties,
      });
    }
  }

  /**
   * Set user properties across all providers
   */
  async setUserProperties(properties: Record<string, unknown>): Promise<void> {
    if (!this.userId) {
      console.warn('Cannot set user properties: No user ID set');
      return;
    }

    for (const provider of this.providers) {
      await provider.setUserProperties(this.userId, properties);
    }
  }
}
