FROM docker:28-cli AS docker-tools

FROM jenkins/jenkins:lts

USER root

COPY --from=docker-tools /usr/local/bin/docker /usr/local/bin/docker

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        nodejs \
        npm \
        wget \
    && curl -fsSL -o /usr/local/bin/kubectl https://dl.k8s.io/release/v1.34.1/bin/linux/amd64/kubectl \
    && chmod +x /usr/local/bin/docker /usr/local/bin/kubectl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && node --version \
    && npm --version \
    && docker --version \
    && kubectl version --client=true

USER jenkins
