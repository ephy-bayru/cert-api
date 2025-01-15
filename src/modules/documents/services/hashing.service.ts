import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Provides flexible hashing features using Node.js crypto.
 * Supports:
 *   - SHA-256, SHA-512
 *   - Optional salting
 *   - Chunk-based hashing for large data
 */
@Injectable()
export class HashingService {
    /**
     * Generates a SHA-256 digest of the given buffer.
     */
    computeSha256(buffer: Buffer): string {
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }

    /**
     * Generates a SHA-512 digest of the given buffer.
     */
    computeSha512(buffer: Buffer): string {
        return crypto.createHash('sha512').update(buffer).digest('hex');
    }

    /**
     * Generates a salted SHA-256 digest by prepending the salt to the buffer.
     */
    computeSaltedHash(buffer: Buffer, salt: string): string {
        const combined = Buffer.concat([Buffer.from(salt, 'utf-8'), buffer]);
        return crypto.createHash('sha256').update(combined).digest('hex');
    }

    /**
     * Incrementally computes a SHA-256 digest in chunks to handle large buffers.
     */
    async computeSha256Chunked(buffer: Buffer, chunkSize = 64 * 1024): Promise<string> {
        const hash = crypto.createHash('sha256');
        let offset = 0;

        while (offset < buffer.length) {
            const end = Math.min(offset + chunkSize, buffer.length);
            hash.update(buffer.subarray(offset, end));
            offset = end;
        }

        return hash.digest('hex');
    }
}
