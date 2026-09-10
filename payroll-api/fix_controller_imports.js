const fs = require('fs');
let file = 'src/payroll/payroll.controller.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { Controller, Post, Body, Get, Param, Patch, UseGuards, Req, Query, Res } from '@nestjs/common';",
  "import { Controller, Post, Body, Get, Param, Patch, UseGuards, Req, Query, Res, BadRequestException } from '@nestjs/common';"
);

fs.writeFileSync(file, content);
console.log('Fixed imports in controller');
