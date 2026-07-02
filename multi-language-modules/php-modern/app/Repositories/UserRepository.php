<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserRepository implements UserRepositoryInterface
{
    public function create(array $data): User { return User::create($data); }

    public function update(int $id, array $data): ?User
    {
        $user = $this->findById($id);
        if (!$user) return null;
        $user->update($data);
        return $user->fresh();
    }

    public function delete(int $id): bool
    {
        $user = $this->findById($id);
        return $user ? (bool) $user->delete() : false;
    }

    public function findById(int $id): ?User { return User::find($id); }
    public function findByEmail(string $email): ?User { return User::where('email', $email)->first(); }

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = User::query();
        foreach (['role', 'status'] as $field) {
            if (!empty($filters[$field])) $query->where($field, $filters[$field]);
        }
        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }
        return $query->paginate($perPage);
    }

    public function search(string $query, string $field = 'name'): Collection
    {
        return User::where($field, 'like', '%' . $query . '%')->limit(50)->get();
    }

    public function all(): Collection { return User::all(); }
}
