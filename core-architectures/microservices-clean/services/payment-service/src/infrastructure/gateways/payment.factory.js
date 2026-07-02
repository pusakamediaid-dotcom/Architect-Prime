'use strict';

class PaymentProviderFactory {
  static create(providerName, config) {
    const providers = {
      midtrans: require('./midtrans.gateway'),
      xendit: require('./xendit.gateway'),
      stripe: require('./stripe.gateway'),
      ovo: require('./ovo.gateway'),
      dana: require('./dana.gateway')
    };

    const ProviderClass = providers[providerName.toLowerCase()];
    if (!ProviderClass) {
      throw new Error(`Payment provider '${providerName}' is not supported`);
    }

    return new ProviderClass(config);
  }

  static getAvailableProviders() {
    return ['midtrans', 'xendit', 'stripe', 'ovo', 'dana'];
  }
}

module.exports = PaymentProviderFactory;