
import { Injectable, Logger } from "@nestjs/common";
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { Frame, Page } from 'puppeteer';
import constants from './../constants';

export class CareerSelector{
    private static readonly logger = new Logger(CareerSelector.name);

     static async hasMoreCareers(page: Page, workingFrame: Frame){
        this.logger.log("Validating if the student has more than one career..")
          let tries = 0
          while (tries < 3){
              await page.waitForTimeout(1000);
              let contetStr = await workingFrame.content();
              if(contetStr.includes(constants.selectors.home.hasMoreCareersValidator)){
                return true
              } else {
                tries++;
              }
          }
         
          return false
      }
      
     static async  processCareersSelection(contentFrame: Frame, selectedCareer: string){
        this.logger.log("The student has more than one career")
        if(!selectedCareer) {
             this.logger.log("No career name provided, choosing the first career on the list..")
             await contentFrame.click("input[type=submit]");
        } else {
            let indexSelected = await this.selectOneCareer(contentFrame, selectedCareer);
            if(indexSelected==-1) {
              this.logger.log("Career '"+selectedCareer+"' NOT found. Choosing the first career on the list..")
              await contentFrame.click("input[type=submit]");
            } else {
                const searchBtn = await contentFrame.$x(constants.selectors.home.btnCareerValidator.replace('{i}', indexSelected.toString()))
                await searchBtn[0].click()
                this.logger.log("Career '"+selectedCareer+"' founds")
            }
        }
      }
    
    static async selectOneCareer(workingFrame: Frame, career: string){
        career=career.toUpperCase()
        let moreRows = true;
        let selector = constants.selectors.home.selectCareerCell;
    
        for(let i=3; moreRows; i++){
            let selectorCell = selector.replace("{i}", i.toString())
    
            try{
              let cell = await PuppeteerService.getElementFromWrapperNoWait(workingFrame, selectorCell);
              let text = await cell.evaluate(c => c.textContent.trim())
    
              if (text.includes(career)){
                return i;
              }
            }catch(e){
              moreRows = false;
            }   
        }
        return -1;
      }
}