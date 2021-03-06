/**
 * npm install -g @angular/cli
 * ng new angular-demo
 * npm install @fluidframework/tinylicious-client fluid-framework concurrently @types/debug
 */

import { Component, OnInit } from '@angular/core';
import { SharedMap } from "fluid-framework";
import { TinyliciousClient } from '@fluidframework/tinylicious-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  fluidSharedObjects: any;  // TODO define type
  localTimestamp: any; // TODO define type

  ngOnInit() {
    this.getFluidData()
      .then((data) => {
        this.fluidSharedObjects = data;
        this.syncData();
      });
  }

  async getFluidData() {

    // TODO 1: Configure the container.
    const client = new TinyliciousClient();
    const containerSchema = {
      initialObjects: { sharedTimestamp: SharedMap }
    };


    // TODO 2: Get the container from the Fluid service.
    let container;
    const containerId = location.hash.substring(1);
    if (!containerId) {
      ({ container } = await client.createContainer(containerSchema));
      const id = await container.attach();
      location.hash = id;
    }
    else {
      ({ container } = await client.getContainer(containerId, containerSchema));
    }

    // TODO 3: Return the Fluid timestamp object.
    return container.initialObjects;

  }

  syncData() {
    if (this.fluidSharedObjects) {

      // TODO 4: Set the value of the localTimestamp state object that will appear in the UI.
      const { sharedTimestamp } = this.fluidSharedObjects;
      const updateLocalTimestamp = () => this.localTimestamp = { time: sharedTimestamp.get("time") };
      updateLocalTimestamp();

      // TODO 5: Register handlers.
      sharedTimestamp.on("valueChanged", updateLocalTimestamp);

      // TODO 6: Delete handler registration when the React App component is dismounted.
      return () => { sharedTimestamp.off("valueChanged", updateLocalTimestamp) }

    }
    else {
      return; // Do nothing because there is no Fluid SharedMap object yet.
    }
  }

  onButtonClick() {
    this.fluidSharedObjects.sharedTimestamp.set("time", Date.now().toString());
  }

}
