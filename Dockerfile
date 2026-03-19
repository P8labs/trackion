FROM golang:1.26-alpine AS builder
WORKDIR /src

RUN apk add --no-cache ca-certificates tzdata

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ARG VERSION=dev
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -trimpath -ldflags="-s -w -X main.version=${VERSION}" -o /out/trackion-server ./cmd

FROM alpine:3.22
WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /out/trackion-server /usr/local/bin/trackion-server

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/trackion-server"]
