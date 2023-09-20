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

async function main(){
    const files = getAllFiles("./data/blog")
    console.log("detect files: ",files)
    files.map((f)=>{
        const buf = fs.readFileSync(f)
        let raw = buf.toString()
        const puml = raw.match(/```plantuml[^]*?```/g)
        if(puml){
            puml.map((p)=>{
                // 1. ```plantuml + code + ``` => @startuml + code + @enduml
                // 2. encode to url params
                // 3. get url that is image from http://www.plantuml.com/plantuml/svg/
                // 4. replace raw data to [image](url)
                console.log(`detect pattern in ${f}`)
                raw = raw.replace(p,`![image](http://www.plantuml.com/plantuml/svg/${encoder.encode(p.replace("```plantuml","@startuml").replace("```","@enduml"))})`)
            })
            fs.writeFileSync(f,raw)
        }else{
            console.log(`pattern not found in ${f}`)
        }
    })
}

main()