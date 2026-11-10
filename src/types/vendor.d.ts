declare module "jsonpack" {
    const jsonpack: {
        pack(value: unknown): string
        unpack(data: string): unknown
    }
    export default jsonpack
}

declare module "lzbase62" {
    const lzbase62: {
        compress(data: string): string
        decompress(data: string): string
    }
    export default lzbase62
}

declare module "pako" {
    const pako: {
        deflate(data: string | Uint8Array, options: { to: "string" }): string
        deflate(data: string | Uint8Array, options?: unknown): Uint8Array
        inflate(data: string | Uint8Array, options: { to: "string" }): string
        inflate(data: string | Uint8Array, options?: unknown): Uint8Array
        gzip(data: string | Uint8Array, options?: unknown): Uint8Array
        ungzip(data: string | Uint8Array, options?: unknown): Uint8Array
    }
    export default pako
}
