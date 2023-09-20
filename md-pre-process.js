const encoder = require('plantuml-encoder')
const fs = require('fs')

function getAllFiles(dir){
    const cur = fs.readdirSync(dir,{withFileTypes:true})
    const files = cur.reduce((pf,cf)=>{
        if(cf.isDirectory()){
            const _files = getAllFiles(`${cf.path+"/"+cf.name}`)
            pf = pf.concat(_files)
        }else{
            if(cf.name.match(/[^]*.mdx/)) {
                pf.push(cf.path+"/"+cf.name)
            }
        }
        return pf
    },[])
    return files
}

function plantUMLPreProcess(file){
    let fileContent = fs.readFileSync(file).toString()
    const puml = fileContent.match(/```plantuml[^]*?```/g)
    if(puml){
        puml.map((p)=>{
            // 1. ```plantuml + code + ``` => @startuml + code + @enduml
            // 2. encode to url params
            // 3. get url that is image from http://www.plantuml.com/plantuml/svg/
            // 4. replace raw data to [image](url)
            console.log(`detect plantuml pattern in ${file}: ${p}`)
            fileContent = fileContent.replace(p,`![image](http://www.plantuml.com/plantuml/svg/${encoder.encode(p.replace("```plantuml","@startuml").replace("```","@enduml"))})`)
        })
        fs.writeFileSync(file, fileContent)
    }else{
        console.log(`plantuml pattern not found in ${file}`)
    }
}

function blogResourcePreProcess(file){
    let fileContent = fs.readFileSync(file).toString()
    const res = fileContent.match(/\[[^\[\]]*?\]\([^\[\]]*?\/res\/[^\[\]]*?\)/g)
    if(res){
        res.map((i)=>{
            console.log(`detect blog-resource pattern in ${file}: ${i}`)
            fileContent = fileContent.replace(i, i.replace(/\([^]*?\/res/,"(/static/resources"))
        })
        fs.writeFileSync(file, fileContent)
    }else{
        console.log(`blog-resource pattern not found in ${file}`)
    }
}

async function main(){
    const files = getAllFiles("./data/blog")
    console.log("detect files: ",files)
    files.map((f)=>{
        plantUMLPreProcess(f)
        blogResourcePreProcess(f)
    })

}

main()