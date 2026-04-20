'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export function SwaggerPageContent() {
  return (
    <div className="bg-white min-h-screen py-10 rounded-lg">
      <SwaggerUI url="/api/openapi" />
    </div>
  );
}
