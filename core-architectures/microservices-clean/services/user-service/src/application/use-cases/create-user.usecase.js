'use strict';

const UserEntity = require('../../domain/entities/user.entity');

class CreateUserUseCase {
  constructor(userRepository, passwordService, eventPublisher) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.eventPublisher = eventPublisher;
  }

  async execute(createUserDTO) {
    const existingUser = await this.userRepository.findByEmail(createUserDTO.email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await this.passwordService.hash(createUserDTO.password);
    
    const user = UserEntity.create({
      name: createUserDTO.name,
      email: createUserDTO.email,
      passwordHash,
      phone: createUserDTO.phone,
      dateOfBirth: createUserDTO.dateOfBirth,
      address: createUserDTO.address,
      role: createUserDTO.role || 'user',
      metadata: createUserDTO.metadata || {}
    });

    const validation = user.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const savedUser = await this.userRepository.save(user);

    await this.eventPublisher.publish('user.created', {
      userId: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      timestamp: new Date().toISOString()
    });

    return savedUser;
  }
}

module.exports = CreateUserUseCase;