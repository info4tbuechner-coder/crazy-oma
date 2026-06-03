
export async function encrypt(data: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const passwordBytes = encoder.encode(password);
    
    // Hash password to get a key
    const passwordHash = await crypto.subtle.digest('SHA-256', passwordBytes);
    
    // Derive AES-GCM key
    const key = await crypto.subtle.importKey(
        'raw', passwordHash, { name: 'AES-GCM' }, false, ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv }, key, dataBytes
    );
    
    // Combine iv and data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Base64 encode
    return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encryptedBase64: string, password: string): Promise<string> {
    const combined = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const passwordBytes = new TextEncoder().encode(password);
    const passwordHash = await crypto.subtle.digest('SHA-256', passwordBytes);
    const key = await crypto.subtle.importKey(
        'raw', passwordHash, { name: 'AES-GCM' }, false, ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv }, key, data
    );
    
    return new TextDecoder().decode(decrypted);
}
