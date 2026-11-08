"""Prepara o YAML do serviço do Cloud Run para publicar uma imagem nova (D23).

O serviço foi publicado pelo AI Studio "a partir do código-fonte", o que deixa anotações de build
(`run.googleapis.com/sources`, `base-images`, `build-*`) apontando para o código antigo. Com uma
imagem pronta, o Cloud Run recusa o deploy enquanto elas existirem. Variáveis, segredos, conta de
serviço e escala ficam como estão no serviço.

Uso: gcloud run services describe SERVICE --format export | python3 prepareCloudRunService.py IMAGEM
"""

import re
import sys

import yaml

SOURCE_ANNOTATION = re.compile(r"^run\.googleapis\.com/(sources|base-images|build-)")


def strip_source_annotations(metadata):
    annotations = (metadata or {}).get("annotations")
    if not annotations:
        return
    for key in [key for key in annotations if SOURCE_ANNOTATION.match(key)]:
        del annotations[key]


def prepare(service, image):
    strip_source_annotations(service.get("metadata"))
    template = service["spec"]["template"]
    strip_source_annotations(template.get("metadata"))
    # O nome da revisão precisa ser novo a cada deploy; sem ele, o Cloud Run gera um.
    (template.get("metadata") or {}).pop("name", None)
    containers = template["spec"]["containers"]
    if len(containers) != 1:
        raise SystemExit(f"esperado 1 container no serviço, encontrado {len(containers)}")
    containers[0]["image"] = image
    containers[0].pop("baseImageUri", None)
    return service


if __name__ == "__main__":
    if len(sys.argv) != 2 or not sys.argv[1]:
        raise SystemExit("uso: prepareCloudRunService.py IMAGEM < servico.yaml")
    service = yaml.safe_load(sys.stdin)
    yaml.safe_dump(prepare(service, sys.argv[1]), sys.stdout, sort_keys=False)
