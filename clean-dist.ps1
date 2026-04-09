$path = 'E:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\dist'
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule('Everyone','FullControl','ContainerInherit,ObjectInherit','None','Allow')

if (Test-Path $path) {
    $acl = Get-Acl $path
    $acl.SetAccessRule($rule)
    Set-Acl $path $acl
    
    Get-ChildItem $path -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
        $itemAcl = Get-Acl $_.FullName
        $itemAcl.SetAccessRule($rule)
        Set-Acl $_.FullName $itemAcl
    }
    
    Remove-Item $path -Recurse -Force
    
    if (Test-Path $path) {
        Write-Host 'still exists'
    } else {
        Write-Host 'removed'
    }
} else {
    Write-Host 'not found'
}
