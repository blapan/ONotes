browser.browserAction.onClicked.addListener(function() {
  browser.sidebarAction.toggle();
});

var odm, omm;

var testArr = [
  { label: "TEST0", value: "TEST0" },
  { label: "TEST1", value: "TEST1" },
  { label: "TEST2", value: "TEST2" },
  { label: "TEST3", value: "TEST3" },
  { label: "TEST4", value: "TEST4" },
  { label: "TEST5", value: "TEST5" },
  { label: "TEST6", value: "TEST6" },
  { label: "TEST7", value: "TEST7" },
  { label: "TEST8", value: "TEST8" },
  { label: "TEST9", value: "TEST9" },
  { label: "TEST10 FOLDER", value: [
    { label: "SUBTEST0", value: "SUBTEST0" },
    { label: "SUBTEST1", value: "SUBTEST1" },
    { label: "SUBTEST2 SUBFOLDER", value: [
      { label: "SUBTEST2 SUBFOLDER-SUBTEST0", value: "SUBTEST2 SUBFOLDER-SUBTEST0" },
      { label: "SUBTEST2 SUBFOLDER-SUBTEST1", value: "SUBTEST2 SUBFOLDER-SUBTEST1" }
    ] },
    { label: "SUBTEST3", value: "SUBTEST3" },
    { label: "SUBTEST4", value: "SUBTEST4" },
    { label: "SUBTEST5 SUBFOLDER", value: [
      { label: "SUBTEST5 SUBFOLDER-SUBTEST0", value: "SUBTEST5 SUBFOLDER-SUBTEST0" },
      { label: "SUBTEST5 SUBFOLDER-SUBTEST1", value: "SUBTEST5 SUBFOLDER-SUBTEST1" }
    ] },
  ] },    
  { label: "TEST11", value: "TEST11" },
  { label: "TEST12", value: "TEST12" },
  { label: "TEST13", value: "TEST13" },
  { label: "TEST14", value: "TEST14" },
  { label: "TEST15", value: "TEST15" },
  { label: "TEST16", value: "TEST16" },
  { label: "TEST17 EMPTY FOLDER", value: [] },
  { label: "TEST22", value: "TEST22" },
];
var testTrash = [
  { label: "TEST18", value: "TEST18" },
  { label: "TEST19", value: "TEST19" },
  { label: "TEST FOLDER IN TRASH", value: [
    { label: "TRASH SUBTEST1", value: "TRASH SUBTEST1" },
    { label: "TRASH SUBTEST2", value: "TRASH SUBTEST2" },
    { label: "TRASH SUBTEST3", value: "TRASH SUBTEST3" },
    { label: "TRASH SUBTEST4", value: "TRASH SUBTEST4" },
  ] },
  { label: "TEST20", value: "TEST20" },
  { label: "TEST21", value: "TEST21" },
];

async function ONotesStartup() {
  odm = new ONotesDataManager();
  await odm.load();
  omm = new ONotesMenuManager(odm);
}

ONotesStartup();
