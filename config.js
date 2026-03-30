/**
 * Configuration Module
 * Centralized environment and app configuration
 */

(function (global) {
  'use strict';

  const Config = {
    // Environment
    env: typeof process !== 'undefined' && process.env ? process.env.NODE_ENV : 'production',
    
    // Supabase Configuration
    supabase: {
      url: 'https://sxsfqvcxikdsahhidrdx.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c2ZxdmN4aWtkc2FoaGlkcmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjg3NTQsImV4cCI6MjA4ODkwNDc1NH0.5ftyFtzmIlvNX-Oj5p-0JwwJEBHajUn5XBAVjkLC82Y',
    },

    // Application Version
    app: {
      name: 'SUB INFRA',
      version: '1.0.6',
      environment: 'production',
    },

    // Debug Settings
    debug: {
      enableConsole: false, // Set to true for development
      enablePerformanceLogging: false,
      enableNetworkLogging: false,
    },

    // Initialize from environment
    init() {
      // Override from window environment if available
      if (window.__CONFIG__) {
        Object.assign(this, window.__CONFIG__);
      }

      // Override debug settings based on environment
      if (this.env === 'development' || this.env === 'development-local') {
        this.debug.enableConsole = true;
      }

      return this;
    },

    /**
     * Log helper - only logs if debug is enabled
     */
    log(...args) {
      if (this.debug.enableConsole) {
        console.log('[SUB INFRA]', ...args);
      }
    },

    /**
     * Get Supabase configuration
     */
    getSupabaseConfig() {
      return {
        url: this.supabase.url,
        key: this.supabase.anonKey,
      };
    },

    /**
     * Check if in development mode
     */
    isDevelopment() {
      return this.env === 'development' || this.env === 'development-local';
    },

    /**
     * Check if in production mode
     */
    isProduction() {
      return this.env === 'production';
    },
  };

  // Initialize config
  Config.init();

  // Export to global scope
  global.AppConfig = Config;
})(window);
