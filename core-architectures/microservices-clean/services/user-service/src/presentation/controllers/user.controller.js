'use strict';

class UserController {
  constructor(createUserUseCase, getUserUseCase, updateUserUseCase, deleteUserUseCase, listUsersUseCase) {
    this.createUserUseCase = createUserUseCase;
    this.getUserUseCase = getUserUseCase;
    this.updateUserUseCase = updateUserUseCase;
    this.deleteUserUseCase = deleteUserUseCase;
    this.listUsersUseCase = listUsersUseCase;
  }

  async create(req, res, next) {
    try {
      const { CreateUserDTO, UserResponseDTO } = require('../../application/dtos/create-user.dto');
      const dto = CreateUserDTO.fromRequest(req.body);
      
      const validation = dto.validate();
      if (!validation.isValid) {
        return res.status(422).json({
          success: false,
          errors: validation.errors
        });
      }

      const user = await this.createUserUseCase.execute(dto);
      
      res.status(201).json({
        success: true,
        data: UserResponseDTO.fromEntity(user)
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { UserResponseDTO } = require('../../application/dtos/create-user.dto');
      const user = await this.getUserUseCase.execute(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: UserResponseDTO.fromEntity(user)
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { UpdateUserDTO, UserResponseDTO } = require('../../application/dtos/create-user.dto');
      const dto = UpdateUserDTO.fromRequest(req.body);
      
      if (!dto.hasUpdates()) {
        return res.status(400).json({
          success: false,
          message: 'No updates provided'
        });
      }

      const user = await this.updateUserUseCase.execute(req.params.id, dto);
      
      res.json({
        success: true,
        data: UserResponseDTO.fromEntity(user)
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.deleteUserUseCase.execute(req.params.id);
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const { page = 1, limit = 20, status, role } = req.query;
      
      const result = await this.listUsersUseCase.execute({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        role
      });

      res.json({
        success: true,
        data: result.data.map(u => UserResponseDTO.fromEntity(u)),
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;