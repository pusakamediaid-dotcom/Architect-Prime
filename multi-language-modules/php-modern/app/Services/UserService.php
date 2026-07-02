<?php

namespace App\Services;

use App\Repositories\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}
    
    /**
     * Create a new user
     */
    public function createUser(array $data): User
    {
        $data['password'] = Hash::make($data['password']);
        
        return $this->userRepository->create($data);
    }
    
    /**
     * Update user by ID
     */
    public function updateUser(int $id, array $data): ?User
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        
        return $this->userRepository->update($id, $data);
    }
    
    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?User
    {
        return $this->userRepository->findByEmail($email);
    }
    
    /**
     * Get all users with pagination
     */
    public function getAllUsers(int $perPage = 15)
    {
        return $this->userRepository->paginate($perPage);
    }
}
