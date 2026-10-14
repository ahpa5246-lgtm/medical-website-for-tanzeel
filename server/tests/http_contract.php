<?php
require __DIR__.'/../src/app.php';
function check(bool $condition,string $name): void { if(!$condition)throw new RuntimeException($name);echo "PASS $name\n"; }
$temp=sys_get_temp_dir().'/medical-php-'.bin2hex(random_bytes(4));mkdir($temp);file_put_contents($temp.'/index.html','<html>synthetic app</html>');file_put_contents($temp.'/app.js','console.log("synthetic")');file_put_contents($temp.'/.env','private');
$config=['publicDir'=>$temp,'backendUrl'=>'','backendKey'=>''];
$r=medical_response('GET','/api/health',[], '',$config);check($r['status']===200,'health');
$r=medical_response('GET','/api/unknown',[], '',$config);check($r['status']===404&&str_contains($r['headers']['Content-Type'],'json'),'unknown API is JSON 404');
$r=medical_response('GET','/doctors/example',[], '',$config);check($r['status']===200&&str_contains($r['body'],'synthetic app'),'deep link serves SPA');
$r=medical_response('GET','/missing.js',[], '',$config);check($r['status']===404,'missing asset not SPA');
$r=medical_response('GET','/.env',[], '',$config);check($r['status']===404&&!str_contains($r['body'],'private'),'private file inaccessible');
$r=medical_response('GET','/../.env',[], '',$config);check($r['status']===404,'traversal inaccessible');
$r=medical_response('POST','/api/content-reports',['content-type'=>'application/json'], '{}',$config);check($r['status']===401,'anonymous write denied');
$r=medical_response('POST','/api/content-reports',['authorization'=>'Bearer synthetic','content-type'=>'application/json'], '{',$config);check($r['status']===400,'malformed JSON denied');
$r=medical_response('POST','/api/content-reports',['authorization'=>'Bearer synthetic','content-type'=>'application/json'],str_repeat('x',9000),$config);check($r['status']===413,'oversize denied');
$r=medical_response('POST','/api/content-reports',['authorization'=>'Bearer synthetic','content-type'=>'application/json'],json_encode(['contentId'=>'11111111-1111-4111-8111-111111111111','operationId'=>'22222222-2222-4222-8222-222222222222','reason'=>'Synthetic report reason']),$config);check($r['status']===503,'unconfigured write fails safely');
$r=medical_response('DELETE','/api/content-reports',[], '',$config);check($r['status']===405,'unsupported method');
echo "11 HTTP contract checks passed\n";
