# AMECA Elastic IP And API DNS Setup

Use this checklist when changing or setting up the backend EC2 public address for AMECA.

## Target Setup

```text
Frontend -> https://api.amecaac.org -> DNS A record -> AWS Elastic IP -> EC2 nginx -> 127.0.0.1:8000 backend
```

The preferred setup is to keep the raw Elastic IP out of app code and GitHub secrets where possible. Use `api.amecaac.org` in application and deployment configuration, and let DNS point that hostname to the Elastic IP.

## 1. Allocate Or Confirm The Elastic IP

In AWS:

```text
EC2 -> Elastic IPs
```

If there is no Elastic IP yet:

```text
Allocate Elastic IP address
```

Then associate it to the backend EC2 instance:

```text
Elastic IPs -> select IP -> Actions -> Associate Elastic IP address
```

Choose the EC2 instance running the AMECA backend.

## 2. Update DNS

In the DNS provider for `amecaac.org`, set or update:

```text
Type: A
Name: api
Value: YOUR_ELASTIC_IP
```

This makes:

```text
api.amecaac.org -> YOUR_ELASTIC_IP
```

## 3. Update GitHub Actions Secret

In the backend GitHub repository:

```text
Settings -> Secrets and variables -> Actions
```

Set:

```text
EC2_HOST=api.amecaac.org
```

Using the domain is preferred over the raw Elastic IP. If the IP changes later, only DNS needs to change.

The backend deploy workflows reference this secret as:

```text
secrets.EC2_HOST
```

## 4. Confirm Backend Nginx Config

The backend repo contains the nginx config at:

```text
../amecaback/deploy/ec2/nginx-ameca-backend.conf
```

It should include:

```nginx
server_name api.amecaac.org;
proxy_pass http://127.0.0.1:8000;
```

On the EC2 server, install or reload the nginx config after changes:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Confirm Frontend Production Env

In Vercel or the frontend hosting provider, set:

```env
NEXT_PUBLIC_API_URL=https://api.amecaac.org/api/v1
```

The local frontend `.env.local` may still use:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

That is fine for local development.

## 6. Confirm Backend CORS Env

On the EC2 server, the backend production env is expected at:

```text
/etc/ameca/backend.env
```

Confirm it allows the production frontend domains, for example:

```env
FRONTEND_URL=https://amecaac.org
CORS_ORIGINS=https://amecaac.org,https://www.amecaac.org
```

## 7. Verify

After DNS has propagated:

```bash
curl http://api.amecaac.org/health
curl https://api.amecaac.org/health
```

Then trigger the backend GitHub Actions deploy. If `EC2_HOST=api.amecaac.org`, GitHub Actions should SSH into the EC2 instance through the domain.

## Where The IP Should Live

The raw Elastic IP should normally exist in:

```text
AWS EC2 -> Elastic IPs
DNS A record for api.amecaac.org
```

It should not need to be committed to frontend or backend code.
