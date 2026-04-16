import  User  from '../student.model.js'

export const handleApplyScholarship = async(req , res)=>{
    try {
        const {studentId , phone ,email ,lookingForCategory ,studentClass ,program} = req.body

        console.log(studentId , " this is request body of handleApplyScholarship ")


        const student = await User.findById(studentId)

        console.log(student , " this is student")


    } catch (error) {
        console.log(error)
        
    }
}