FROM busybox:1.36
COPY run.sh /run.sh
CMD ["sh", "/run.sh"]
