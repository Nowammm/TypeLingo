set -xe

IMAGE_TAG="typelingo"

if [ "$REBUILD_IMAGE" == "true" ]
then
	podman image rm -f $IMAGE_TAG
fi

if ! podman image exists $IMAGE_TAG
then
	podman image build -f Dockerfile -t $IMAGE_TAG
fi

podman run --rm -it \
	--net host \
	-v ./:/workdir \
	-w /workdir \
	--entrypoint /bin/bash \
	-e DEVSHELL=$DEVSHELL \
	$IMAGE_TAG \
	-c '
	if [ "$DEVSHELL" == "true" ]
	then
		bash -l
	else
		set -xe
		web-ext lint -s src
		web-ext build -s src --overwrite-dest
	fi
'
