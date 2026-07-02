<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    public function create(array $data): User;
    
    public function update(int $id, array $data): ?User;
    
    public function delete(int $id): bool;
    
    public function findById(int $id): ?User;
    
    public function findByEmail(string $email): ?User;
    
    public function paginate(int $perPage = 15): LengthAwarePaginator;
    
    public function all(): Collection;
}
