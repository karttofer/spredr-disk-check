# Checks a container's own disk: it writes 12 GB where the limit is 10 GB. With the limit held it stops near 10 GB
# with «No space left on device»; then it deletes what it wrote and only answers its health check.
mkdir -p /www && echo ok > /www/health
httpd -p 8080 -h /www
echo "disk-check: writing 12 GB to /big"
dd if=/dev/zero of=/big bs=1M count=12288 2>&1 | tail -2
echo "disk-check: wrote $(du -m /big | cut -f1) MB"
rm -f /big
echo "disk-check: done, file removed"
while true; do sleep 3600; done
