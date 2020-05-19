
import deepzoom

image = 'PIA23533_index32'

# Specify your source image
SOURCE = f'originals/{image}.tif'


# Create Deep Zoom Image creator with weird parameters
creator = deepzoom.ImageCreator(
    tile_size=128,
    tile_overlap=2,
    tile_format="tif",
    image_quality=0.8,
    resize_filter="bicubic",
)

# Create Deep Zoom image pyramid from source
creator.create(SOURCE, f'outputs/{image}.dzi')
