'use strict';

const { performance } = require('perf_hooks');

function loggable(target, key, descriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args) {
    const start = performance.now();
    const className = target.constructor.name;
    const methodName = key;
    
    console.log(`[LOG] ${className}.${methodName} - Started at ${new Date().toISOString()}`);
    
    try {
      const result = await originalMethod.apply(this, args);
      const duration = (performance.now() - start).toFixed(2);
      console.log(`[LOG] ${className}.${methodName} - Completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      console.error(`[LOG] ${className}.${methodName} - Failed after ${duration}ms: ${error.message}`);
      throw error;
    }
  };
  
  return descriptor;
}

function catchErrors(target, key, descriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      console.error(`[ERROR] ${target.constructor.name}.${key}:`, error);
      throw error;
    }
  };
  
  return descriptor;
}

function memoize(target, key, descriptor) {
  const cache = new Map();
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = originalMethod.apply(this, args);
    cache.set(key, result);
    return result;
  };
  
  return descriptor;
}

module.exports = { loggable, catchErrors, memoize };