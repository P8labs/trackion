FROM alpine:3.22

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

ARG TARGETARCH
ARG TARGETVARIANT

COPY trackion-server-linux-${TARGETARCH}${TARGETVARIANT:+-${TARGETVARIANT}} /usr/local/bin/trackion-server

RUN chmod +x /usr/local/bin/trackion-server

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/trackion-server"]
