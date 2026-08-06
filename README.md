1. All project files are in "tests" folder
2. To run the file npx playwright test tests/filename --headed
like,
npx playwright test tests/dc-power-capacity.spec.js --headed
3. To run the automation script for different id and project name, need to change in code and after saving run the script


CHANGE IN URL, ACCOUNT ID, PROJECT NAME IN AUTOMATED FILES: 
Login:
  Change URL- preprod, prod, Agrola preprod, Agrola prod:
    In all files, line number 47, 65
  In basic flow file- 
    Change url for Battery page and result summary page below 

Account id: 
  In all files, line number 51
  
Project name: 
  In all files, line number 68, 70
