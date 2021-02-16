import React from 'react';
import { Component } from 'react';
import {
  ViewGeometry

} from '@vtk-viewport';
import vtkHttpDataSetReader from 'vtk.js/Sources/IO/Core/HttpDataSetReader';
import vtkVolume from 'vtk.js/Sources/Rendering/Core/Volume';
import vtkVolumeMapper from 'vtk.js/Sources/Rendering/Core/VolumeMapper';
import vtkConeSource from 'vtk.js/Sources/Filters/Sources/ConeSource';
import vtkPolyData from 'vtk.js/Sources/Common/DataModel/PolyData';
import vtkSphereSource from 'vtk.js/Sources/Filters/Sources/SphereSource';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import vtkLookupTable from 'vtk.js/Sources/Common/Core/LookupTable';
// The data here is read from an unscaled *.vti, so we translate our windowCenter.
const PRESETS = {
  BONE: {
    windowWidth: 100,
    windowCenter: 500 + 1024,
  },
  HEAD: {
    windowWidth: 1000,
    windowCenter: 300 + 1024,
  },
};
class VTKGeometry extends Component {
  state = {
    mesh:[],
    mapper:[],
    volumes: [],
    levels: {},
  };

  componentDidMount() {
    this.apis = [];


    const coneSource = vtkConeSource.newInstance();
    const sphereSource = vtkSphereSource.newInstance();
    //sphereSource.Set({'Center':[0,0,0]});
    // sphereSource.SetRadius(1);
    // sphereSource.Update();
    const poly = vtkPolyData.newInstance();
    poly.shallowCopy(sphereSource.getOutputData());
    const mapper = vtkMapper.newInstance();
    
    const numPts = poly.getPoints().getNumberOfPoints();
    const newArray = new Float32Array(numPts)
    for( let i = 0; i < numPts; ++i )
      {
        newArray[i + 1] = i/numPts;
      //scalars->SetValue(i,static_cast<float>(i)/numPts);
      }
    const da = vtkDataArray.newInstance({
        numberOfComponents: 1,
        values: newArray,
      });
    da.setName('tcoord');

    poly.getPointData().setScalars(da);

    mapper.setInputData(poly);
    //mapper.scalarVisibilityOn();
    mapper.setScalarModeToUsePointData();
    mapper.setColorModeToMapScalars();

    const  hueLut = vtkLookupTable.newInstance();
    
    hueLut.setAlphaRange(1,1);
    hueLut.setRange (0, 1);
    hueLut.setHueRange (1, 0);
    hueLut.setSaturationRange (0.5, 1);
    hueLut.setValueRange (0, 1);
    hueLut.setNumberOfColors(256)
    hueLut.build();
 
    mapper.setLookupTable( hueLut );

    //this.state.mesh=[coneSource.getOutputPort()];
    this.setState({mesh:[coneSource.getOutputPort()],mapper:[mapper]});
    // const reader = vtkHttpDataSetReader.newInstance({
    //   fetchGzip: true,
    // });
    const volumeActor = vtkVolume.newInstance();
    const volumeMapper = vtkVolumeMapper.newInstance();

    volumeActor.setMapper(volumeMapper);

    // reader.setUrl('/headsq.vti', { loadData: true }).then(() => {
    //   const data = reader.getOutputData();
    //   volumeMapper.setInputData(data);

    //   this.setState({
    //     volumes: [volumeActor],
    //   });
    // });
  }



  updateAllViewports = () => {
    Object.keys(this.apis).forEach(viewportIndex => {
      const api = this.apis[viewportIndex];

      api.genericRenderWindow.getRenderWindow().render();
    });
  };

  saveRenderWindow = viewportIndex => {
    return api => {
      // this.apis[viewportIndex] = api;

      // const apis = this.apis;

      // if (viewportIndex === 1) {
      //   const istyle = vtkInteractorStyleMPRWindowLevel.newInstance();

      //   const callbacks = {
      //     setOnLevelsChanged: voi => {
      //       const { windowWidth, windowCenter } = voi;
      //       const levels = this.state.levels || {};

      //       apis.forEach(api => {
      //         const renderWindow = api.genericRenderWindow.getRenderWindow();

      //         api.updateVOI(windowWidth, windowCenter);
      //         renderWindow.render();
      //       });

      //       levels.windowCenter = windowCenter;
      //       levels.windowWidth = windowWidth;

      //       this.setState({
      //         levels,
      //       });
      //     },
      //   };

      //   api.setInteractorStyle({ istyle, callbacks });
      // }
    };
  };

  render() {
    // if (!this.state.volumes || !this.state.volumes.length) {
    //   return <h4>Loading...</h4>;
    // }

    return (
      <div className="row">
        <div className="col-xs-12 col-sm-6">
          <ViewGeometry
            onCreated={this.saveRenderWindow(1)}
            mesh={this.state.mesh}
          />
        </div>
        <div className="col-xs-12 col-sm-6">
          <ViewGeometry
            onCreated={this.saveRenderWindow(1)}
            mapper={this.state.mapper}
          />
        </div>
      </div>
    );
  }
}

export default VTKGeometry;
