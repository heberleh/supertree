


// var tree = new Tree("((Exiguobacterium_sp._AT1b,Exiguobacterium_sibiricum_255-15),((Bacillus_thuringiensis_BMB171,Bacillus_cereus_G9842,(Bacillus_cereus_Q1,Bacillus_cereus_ATCC_10987,Bacillus_thuringiensis_str._Al_Hakam,Bacillus_cereus_03BB102,Bacillus_cereus_AH187,Bacillus_anthracis_str._Sterne)),((Geobacillus_sp._WCH70,(((Staphylococcus_lugdunensis_HKU09-01,Staphylococcus_aureus_RF122),Staphylococcus_carnosus_subsp._carnosus_TM300),(Listeria_monocytogenes_HCC23,(Listeria_monocytogenes_serotype_4b_str._F2365,Listeria_monocytogenes_serotype_4b_str._CLIP_80459)),(Lactococcus_lactis_subsp._cremoris_MG1363,(Streptococcus_suis_98HAH33,((Streptococcus_mitis_B6,(Streptococcus_pneumoniae_670-6B,Streptococcus_pneumoniae_JJA)),Streptococcus_gordonii_str._Challis_substr._CH1))))),Bacillus_clausii_KSM-K16)))");

// console.log("\nPrinting nodes:");
// console.log(tree.nodes);

// console.log("\nPrinting edges:");
// console.log(tree.edges);


var filenameTrees = "./dataset/SPR-Aquificae_rooted.trees";
var filenameSupertree = "./dataset/SPR-Aquificae-Rooting.tre";


var trees = [];
var supertree = null;
function runSuperTree(text){
   supertree = new Supertree(text);
}
function attachTrees(text){
    supertree.attachTrees(text);
}

function createGraph(){
    console.log("Trees was read.");
    graph = new SuperGraph(supertree);
    graph.print();
}

fetch(filenameSupertree)
    .then(response => response.text())
    .then(text => {
                    runSuperTree(text);
                    fetch(filenameTrees)
                        .then(response => response.text())
                        .then(text2 => {attachTrees(text2)})
                        .then(()=>supertree.print())
                        .then(()=>{createGraph()});
                    }
        );


