# Measures a container's disk where it runs: 1 GB written to the disk (fsync), 1 GB as an app writes it, 1 GB read,
# and 2000 small files. MODE=fill instead writes 12 GB to check the 10 GB limit. Then it only answers its health check.
mkdir -p /www && echo ok > /www/health
httpd -p 8080 -h /www
secs() { cut -d' ' -f1 /proc/uptime; }
took() { echo "$1 $2" | awk '{ printf "%.1f s", $2 - $1 }'; }
if [ "${MODE:-speed}" = fill ]; then
  echo "disk-check: writing 12 GB to /big"
  dd if=/dev/zero of=/big bs=1M count=12288 2>&1
  echo "disk-check: wrote $(du -m /big | cut -f1) MB"
  rm -f /big
else
  echo "disk-check: 1 GB written to the disk (fsync)"
  dd if=/dev/zero of=/f bs=1M count=1024 conv=fsync 2>&1 | tail -1
  echo "disk-check: 1 GB as an app writes it"
  dd if=/dev/zero of=/g bs=1M count=1024 2>&1 | tail -1
  echo "disk-check: 1 GB read"
  dd if=/f of=/dev/null bs=1M 2>&1 | tail -1
  echo "disk-check: 2000 small files"
  mkdir -p /s; t0=$(secs); i=0
  while [ $i -lt 2000 ]; do echo "line $i" > /s/$i; i=$((i + 1)); done; sync
  echo "disk-check: small files took $(took "$t0" "$(secs)")"
  rm -rf /f /g /s
fi
echo "disk-check: done, file removed"
while true; do sleep 3600; done
