import { All, Controller, HttpStatus, Param, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Controller('supabase')
export class SupabaseProxyController {
  private target: string;
  private serviceRoleKey: string;

  constructor(private configService: ConfigService) {
    this.target = this.configService.get<string>('SUPABASE_URL') || 'https://yispxbfpbepdwgggwmzf.supabase.co/rest/v1';
    this.serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '';
  }

  @All('/{*path}')
  async proxyRequests(@Req() req: Request, @Res() res: Response, @Param('path') path: string) {
    // Extract path after /supabase prefix
    const query = new URLSearchParams(req.query as any).toString();
    const targetUrl = `${this.target}/${path}${query ? '?' + query : ''}`;

    try {
      const headers = new Headers();

      headers.set('apikey', this.serviceRoleKey);
      headers.set('Authorization', `Bearer ${this.serviceRoleKey}`);

      const options: RequestInit = {
        method: req.method,
        headers,
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        options.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
      }

      const response = await fetch(targetUrl, options);

      // Set response status
      res.status(response.status).json(await response.json());
    } catch (error: any) {
      console.error('Supabase Proxy Error:', error.message);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Supabase Proxy Error');
    }
  }
}
