interface BootstrapType  {
    username: string
    scopes: [string]
    client_id: string
    access_token: string
    client_name: string
    token_type: string
    ratelimit: number
    anonymous: boolean
    client_secret: string
    expire_in: string
    refresh_token: string
}

export default BootstrapType