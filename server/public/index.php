<?php
declare(strict_types=1);
require __DIR__.'/../src/app.php';
$headers=[];foreach(getallheaders() as $key=>$value)$headers[strtolower($key)]=$value;
$config=['publicDir'=>getenv('APP_PUBLIC_DIR')?:dirname(__DIR__,2).'/Build Medical Consultation Platform/dist','backendUrl'=>getenv('SUPABASE_URL')?:'','backendKey'=>getenv('SUPABASE_ANON_KEY')?:''];
header('X-Content-Type-Options: nosniff');header('Referrer-Policy: strict-origin-when-cross-origin');header('X-Frame-Options: DENY');header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
try{
 $response=medical_response($_SERVER['REQUEST_METHOD']??'GET',$_SERVER['REQUEST_URI']??'/', $headers,file_get_contents('php://input',false,null,0,8193),$config);
 http_response_code($response['status']);foreach($response['headers'] as $key=>$value)header($key.': '.$value);echo $response['body'];
}catch(Throwable){http_response_code(500);header('Content-Type: application/json');header('Cache-Control: no-store');echo '{"code":"internal_error"}';}
