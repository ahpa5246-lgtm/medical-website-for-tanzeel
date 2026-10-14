<?php
declare(strict_types=1);

function medical_json(int $status,array $payload): array {
 return ['status'=>$status,'headers'=>['Content-Type'=>'application/json; charset=utf-8','Cache-Control'=>'no-store'],'body'=>json_encode($payload,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR)];
}
function medical_response(string $method,string $uri,array $headers,string $body,array $config): array {
 $path=rawurldecode(parse_url($uri,PHP_URL_PATH)??'/');
 if(str_contains($path,"\0")||preg_match('~(?:^|/)\.{1,2}(?:/|$)~',$path))return medical_json(404,['code'=>'not_found']);
 if($path==='/api/health')return $method==='GET'?medical_json(200,['status'=>'ok']):medical_json(405,['code'=>'method_not_allowed']);
 if($path==='/api/ready')return $method==='GET'?medical_json(!empty($config['backendUrl'])&&!empty($config['backendKey'])?200:503,['configured'=>!empty($config['backendUrl'])&&!empty($config['backendKey'])]):medical_json(405,['code'=>'method_not_allowed']);
 if($path==='/api/content-reports'){
  if($method!=='POST')return medical_json(405,['code'=>'method_not_allowed']);
  if(!preg_match('/^Bearer ([A-Za-z0-9._-]+)$/',$headers['authorization']??'',$token))return medical_json(401,['code'=>'authentication_required']);
  if(strlen($body)>8192)return medical_json(413,['code'=>'payload_too_large']);
  if(!str_starts_with(strtolower($headers['content-type']??''),'application/json'))return medical_json(415,['code'=>'json_required']);
  try{$input=json_decode($body,true,16,JSON_THROW_ON_ERROR);}catch(JsonException){return medical_json(400,['code'=>'invalid_json']);}
  if(!is_array($input)||array_diff(array_keys($input),['contentId','reason','operationId']))return medical_json(400,['code'=>'invalid_fields']);
  $uuid='/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';
  $reason=is_string($input['reason']??null)?trim($input['reason']):'';
  $length=preg_match_all('/./us',$reason);
  if(!is_string($input['contentId']??null)||!preg_match($uuid,$input['contentId'])||!is_string($input['operationId']??null)||!preg_match($uuid,$input['operationId'])||$length===false||$length<10||$length>1000)return medical_json(422,['code'=>'invalid_report']);
  $origin=rtrim($config['backendUrl']??'','/');$key=$config['backendKey']??'';
  $parts=parse_url($origin);
  if(!$key||!$parts||($parts['scheme']??'')!=='https'||empty($parts['host'])||isset($parts['user'])||isset($parts['pass'])||!empty($parts['path'])||!function_exists('curl_init'))return medical_json(503,['code'=>'service_unavailable']);
  $response='';$curl=curl_init($origin.'/rest/v1/rpc/submit_content_report');
  curl_setopt_array($curl,[CURLOPT_POST=>true,CURLOPT_HTTPHEADER=>['Content-Type: application/json','apikey: '.$key,'Authorization: Bearer '.$token[1]],CURLOPT_POSTFIELDS=>json_encode(['p_content_id'=>$input['contentId'],'p_reason'=>$reason,'p_operation_id'=>$input['operationId']],JSON_THROW_ON_ERROR),CURLOPT_CONNECTTIMEOUT=>3,CURLOPT_TIMEOUT=>8,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2,CURLOPT_WRITEFUNCTION=>function($curl,$chunk)use(&$response){if(strlen($response)+strlen($chunk)>8192)return 0;$response.=$chunk;return strlen($chunk);}]);
  $success=curl_exec($curl);$status=curl_getinfo($curl,CURLINFO_RESPONSE_CODE);curl_close($curl);
  if($success===false)return medical_json(503,['code'=>'service_unavailable']);
  if($status<200||$status>=300){$mapped=in_array($status,[401,403,429],true)?$status:400;return medical_json($mapped,['code'=>'report_not_saved']);}
  $id=json_decode($response,true);
  if(!is_string($id)||!preg_match($uuid,$id))return medical_json(502,['code'=>'invalid_service_response']);
  return medical_json(201,['id'=>$id]);
 }
 if(str_starts_with($path,'/api/'))return medical_json(404,['code'=>'not_found']);
 if(!in_array($method,['GET','HEAD'],true))return medical_json(405,['code'=>'method_not_allowed']);
 $root=realpath($config['publicDir']??'');if(!$root)return medical_json(503,['code'=>'build_missing']);
 $extensions=['js'=>'text/javascript','css'=>'text/css','png'=>'image/png','jpg'=>'image/jpeg','jpeg'=>'image/jpeg','webp'=>'image/webp','svg'=>'image/svg+xml','ico'=>'image/x-icon','woff'=>'font/woff','woff2'=>'font/woff2','txt'=>'text/plain','json'=>'application/json'];
 $file=realpath($root.'/'.ltrim($path,'/'));$extension=strtolower(pathinfo($path,PATHINFO_EXTENSION));
 if($file&&str_starts_with($file,$root.DIRECTORY_SEPARATOR)&&is_file($file)&&isset($extensions[$extension])&&!str_contains($path,'/.'))return ['status'=>200,'headers'=>['Content-Type'=>$extensions[$extension],'Cache-Control'=>str_starts_with($path,'/assets/')?'public, max-age=31536000, immutable':'no-cache'],'body'=>$method==='HEAD'?'':file_get_contents($file)];
 if($extension||str_contains($path,'/.'))return medical_json(404,['code'=>'not_found']);
 $known=preg_match('~^/(?:$|auth/(?:login|signup|forgot-password|update-password|accept-invite)$|consultations(?:/[^/]+)?$|doctors(?:/[^/]+)?$|articles(?:/[^/]+)?$|courses(?:/[^/]+)?$|library(?:/[^/]+)?$|training$|labs(?:/[^/]+)?$|verification/apply$|legal/(?:terms|privacy|disclaimer)$|admin(?:/.*)?$)~',$path);
 $index=$root.'/index.html';if(!is_file($index))return medical_json(503,['code'=>'build_missing']);
 return ['status'=>$known?200:404,'headers'=>['Content-Type'=>'text/html; charset=utf-8','Cache-Control'=>'no-cache'],'body'=>$method==='HEAD'?'':file_get_contents($index)];
}
