<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Integration extends Model
{
    /** @use HasFactory<\Database\Factories\IntegrationFactory> */
    use HasFactory;

    public const TYPE_EMAIL = 'email';
    public const PROVIDER_RESEND = 'resend';

    protected $fillable = [
        'user_id',
        'type',
        'provider',
        'config',
        'is_enabled',
        'last_used_at',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'encrypted:array',
            'is_enabled' => 'boolean',
            'last_used_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Mask an API key for display: re_••••••••••••aBcD */
    public static function maskKey(?string $key): ?string
    {
        if (!$key) {
            return null;
        }
        $len = strlen($key);
        if ($len <= 8) {
            return str_repeat('•', $len);
        }
        $prefix = substr($key, 0, 3);  // e.g. "re_"
        $suffix = substr($key, -4);
        return $prefix . str_repeat('•', max(8, $len - 7)) . $suffix;
    }

    public function isUsable(): bool
    {
        return $this->is_enabled && !empty($this->config['api_key'] ?? null);
    }

    public function getApiKey(): ?string
    {
        return $this->config['api_key'] ?? null;
    }

    public function getFromAddress(): ?string
    {
        return $this->config['from_address'] ?? null;
    }
}
