{{/*
Expand the name of the chart.
*/}}
{{- define "terrain-server.name" -}}
{{- default .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "terrain-server.fullname" -}}
{{- $name := default .Chart.Name }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "terrain-server.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create service name as used by the service name label.
*/}}
{{- define "service.fullname" -}}
{{- printf "%s-%s" .Release.Name "service" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "terrain-server.labels" -}}
helm.sh/chart: {{ include "terrain-server.chart" . }}
{{ include "terrain-server.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Returns the tag of the chart.
*/}}
{{- define "terrain-server.tag" -}}
{{- default (printf "v%s" .Chart.AppVersion) .Values.image.tag }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "terrain-server.selectorLabels" -}}
app.kubernetes.io/name: {{ include "terrain-server.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Returns the environment from global if exists or from the chart's values, defaults to development
*/}}
{{- define "terrain-server.environment" -}}
{{- if .Values.global.environment }}
    {{- .Values.global.environment -}}
{{- else -}}
    {{- .Values.environment | default "development" -}}
{{- end -}}
{{- end -}}

{{/*
Returns the cloud provider name from global if exists or from the chart's values, defaults to minikube
*/}}
{{- define "terrain-server.cloudProviderFlavor" -}}
{{- if .Values.global.cloudProvider.flavor }}
    {{- .Values.global.cloudProvider.flavor -}}
{{- else if .Values.cloudProvider -}}
    {{- .Values.cloudProvider.flavor | default "minikube" -}}
{{- else -}}
    {{ "minikube" }}
{{- end -}}
{{- end -}}

{{/*
Returns the cloud provider docker registry url from global if exists or from the chart's values
*/}}
{{- define "terrain-server.cloudProviderDockerRegistryUrl" -}}
{{- if .Values.global.cloudProvider.dockerRegistryUrl }}
    {{- printf "%s/" .Values.global.cloudProvider.dockerRegistryUrl -}}
{{- else if .Values.cloudProvider.dockerRegistryUrl -}}
    {{- printf "%s/" .Values.cloudProvider.dockerRegistryUrl -}}
{{- else -}}
{{- end -}}
{{- end -}}

{{/*
Returns the cloud provider image pull secret name from global if exists or from the chart's values
*/}}
{{- define "terrain-server.cloudProviderImagePullSecretName" -}}
{{- if .Values.global.cloudProvider.imagePullSecretName }}
    {{- .Values.global.cloudProvider.imagePullSecretName -}}
{{- else if .Values.cloudProvider.imagePullSecretName -}}
    {{- .Values.cloudProvider.imagePullSecretName -}}
{{- end -}}
{{- end -}}

{{/*
Returns tracing enabled from global if exists or from chart's values
*/}}
{{- define "terrain-server.tracingEnabled" -}}
{{- if .Values.global.tracing.enabled }}
    {{- .Values.global.tracing.enabled -}}
{{- else -}}
    {{- .Values.env.tracing.enabled -}}
{{- end -}}
{{- end -}}

{{/*
Returns metrics enabled from global if exists or from chart's values
*/}}
{{- define "terrain-server.metricsEnabled" -}}
{{- if .Values.global.metrics.enabled }}
    {{- .Values.global.metrics.enabled -}}
{{- else -}}
    {{- .Values.env.metrics.enabled -}}
{{- end -}}
{{- end -}}

{{/*
Returns tracing url from global if exists or from chart's values
*/}}
{{- define "terrain-server.tracingUrl" -}}
{{- if .Values.global.tracing.url }}
    {{- .Values.global.tracing.url -}}
{{- else -}}
    {{- .Values.env.tracing.url -}}
{{- end -}}
{{- end -}}

{{/*
Returns metrics url from global if exists or from chart's values
*/}}
{{- define "terrain-server.metricsUrl" -}}
{{- if .Values.global.metrics.url }}
    {{- .Values.global.metrics.url -}}
{{- else -}}
    {{- .Values.env.metrics.url -}}
{{- end -}}
{{- end -}}
