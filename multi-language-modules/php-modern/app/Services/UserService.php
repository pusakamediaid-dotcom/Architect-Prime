<?php

namespace App\Services;

use App\Repositories\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(private UserRepositoryInterface $userRepository) {}

    public function create(array $data): User
    {
        $data['password'] = Hash::make($data['password']);
        $data['status'] = $data['status'] ?? 'active';
        return $this->userRepository->create($data);
    }

    public function paginate(int $perPage = 15, array $filters = []): mixed
    {
        return $this->userRepository->paginate($perPage, is_array($filters) ? $filters : []);
    }

    public function findById(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }

    public function update(int $id, array $data): User
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        $user = $this->userRepository->update($id, $data);
        if (!$user) {
            throw new \RuntimeException('User not found');
        }
        return $user;
    }

    public function delete(int $id): void
    {
        if (!$this->userRepository->delete($id)) {
            throw new \RuntimeException('User not found');
        }
    }

    public function search(string $query, ?string $field = null): mixed
    {
        return $this->userRepository->search($query, $field ?: 'name');
    }

    public function suspend(int $id, string $reason): User
    {
        return $this->update($id, ['status' => 'suspended', 'suspension_reason' => $reason]);
    }

    public function changePassword(int $id, string $currentPassword, string $newPassword): void
    {
        $user = $this->findById($id);
        if (!$user || !Hash::check($currentPassword, $user->password)) {
            throw new \InvalidArgumentException('Invalid current password');
        }
        $this->update($id, ['password' => $newPassword]);
    }

    public function verifyEmail(int $userId, string $token): bool
    {
        return $token !== '' && (bool) $this->userRepository->update($userId, ['email_verified_at' => now()]);
    }
}
