## Lensing

#### Note
This plugin introduces a lens to the OpenSeadragon viewer with several characteristic features, including hi-res magnification, physical measurements, exportable snapshots, customized overlays, and localized filtering.
The overlays and filters in particular can be extended to support application-specific tasks.

#### Refs.
+ [npm](https://www.npmjs.com/package/lensing) - `npm i lensing`
+ [github](https://github.com/jessupjs/lensing) - `git clone git@github.com:jessupjs/lensing.git`

#### Use
1. Install w NPM
2. Import at top of .js:
    ```
    import * as osd from 'openseadragon';
    import * as l from 'lensing';
    ```
3. After original OSD viewer is instantiated, construct the lensing hidden viewer:
    ```
    // Instantiate viewer
    const viewer = osd(viewer_config);
   
    // Compile dataLoad, i.e. custom filters (empty by default)
    const dataLoad = []
   
    // Instantiate Lensing
    viewer.lensing = l.construct(osd, viewer, viewer_config, dataLoad);
    ```
   
4. Refer to the following examples if useful:
   1. [Lensing Demo](https://github.com/jessupjs/lensing-demo) - a small application that demonstrates the lensing tool's core functionalities.
   2. [Scope2Screen](https://github.com/labsyspharm/scope2screen) - a domain-specific application (digital histopathology) that presents examples for extending functionality with custom filters and annotations.


