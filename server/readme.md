## Lensing :: Server

#### Notes

1. Setup conda environment
<br>a. `conda create -n lenv python=3.8`
<br>b. `conda activate`

2. Setup DeepZoom (will cut out later): `python modules/MyDeepZoom/deepzoom.py/setup.py install`

3. Install packages: `pip install -r requirements.txt`

4. Basic Flask - 
https://flask.palletsprojects.com/en/1.1.x/quickstart/#quickstart

5. DZI's with deepzoom.py - 
https://github.com/openzoom/deepzoom.py
<br>a. Generate in .dzi in modules/MyDeepZoom/make_dzi.py
    
6. Assets from JPL-Caltech > indexed in Photoshop to n-colors
<br>a. Anti-Atlas Mtns., Morocco - 
https://www.jpl.nasa.gov/spaceimages/details.php?id=PIA23533
<br>b. Dneiper River, Ukraine - 
https://www.jpl.nasa.gov/spaceimages/details.php?id=PIA23912

7. Custom lens event at server/static/js/Lensing.js

8. Magnification refs
 + https://bost.ocks.org/mike/fisheye/
 + https://dl.acm.org/doi/10.1145/142750.142763