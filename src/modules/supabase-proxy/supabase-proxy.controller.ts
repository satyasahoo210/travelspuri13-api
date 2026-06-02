import { Controller, All, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('supabase')
export class SupabaseProxyController {
  private target: string;

  constructor(private configService: ConfigService) {
    this.target = this.configService.get<string>('SUPABASE_URL') || 'https://yispxbfpbepdwgggwmzf.supabase.co';
  }

  @All('*')
  async proxyRequests(@Req() req: Request, @Res() res: Response) {
    // Extract path after /supabase prefix
    const path = req.params[0] || '';
    const query = new URLSearchParams(req.query as any).toString();
    const targetUrl = `${this.target}/${path}${query ? '?' + query : ''}`;

    try {
      const headers = new Headers();
      
      // Copy incoming request headers, omitting connection & host headers
      Object.entries(req.headers).forEach(([key, value]) => {
        if (value && key !== 'host' && key !== 'connection' && key !== 'content-length') {
          headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        }
      });

      const options: RequestInit = {
        method: req.method,
        headers,
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        options.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
      }

      const response = await fetch(targetUrl, options);

      // Set response status
      res.status(response.status);

      // Copy response headers
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      // Stream output
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error('Supabase Proxy Error:', error.message);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Supabase Proxy Error');
    }
  }
}
