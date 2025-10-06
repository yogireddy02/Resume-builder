import React from "react";
import { useState } from "react";
import "./Home.css";
function HomePage(){
    const[formData,setFormData]=useState({
        companyName:"",
        applyingAsA:"Fresher",
        coverLetterTone:"Formal",
        jobDescription:"",
        currentResume:""
    });
    const [geminiResponse,setGeminiResponse]=useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    
    // Helper: parse Gemini plain-text response into titled sections with HTML-safe content
    function parseGeminiResponse(text){
        if(!text) return [];
        const normalized = text.replace(/\r\n/g,'\n');
        const headingRegex = /^\s*(\d+)\.\s*(.+)$/gm;
        const matches = [];
        let m;
        while((m = headingRegex.exec(normalized)) !== null){
            matches.push({index: m.index, num: m[1], title: m[2]});
        }
        // If no numbered headings found, return whole text as one section
        if(matches.length === 0){
            return [{title: 'Result', html: toHtml(normalized.trim())}];
        }
        const sections = [];
        for(let i=0;i<matches.length;i++){
            const startLineEnd = normalized.indexOf('\n', matches[i].index);
            const contentStart = startLineEnd === -1 ? normalized.length : startLineEnd + 1;
            const end = (i+1 < matches.length) ? matches[i+1].index : normalized.length;
            const content = normalized.slice(contentStart, end).trim();
            sections.push({title: `${matches[i].num}. ${matches[i].title}`, html: toHtml(content)});
        }
        return sections;
    }

    function toHtml(text){
        if(!text) return '';
        // escape HTML
        const esc = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const lines = esc.split('\n');
        let html = '';
        let inList = false;
        for(const raw of lines){
            const line = raw.trim();
            if(/^[-*]\s+/.test(line)){
                if(!inList){ html += '<ul>'; inList = true; }
                html += `<li>${line.replace(/^[-*]\s+/, '')}</li>`;
            } else {
                if(inList){ html += '</ul>'; inList = false; }
                if(line === ''){
                    html += '<p></p>';
                } else {
                    // convert single line to a paragraph-like line with break
                    html += `${line}<br/>`;
                }
            }
        }
        if(inList) html += '</ul>';
        return html;
    }

    // Copy plain text of a section to clipboard
    function copySection(html){
        // convert simple <br/> and <li> into newlines for plain text copy
        const tmp = html.replace(/<br\/?\s*>/g, '\n').replace(/<li>/g,'- ').replace(/<\/li>/g,'\n').replace(/<[^>]+>/g,'');
        navigator.clipboard?.writeText(tmp).then(()=>{
            // feedback could be added later
        }).catch(()=>{});
    }
    async function handleGenerateData(){
        if(!formData.companyName || !formData.applyingAsA || !formData.coverLetterTone || !formData.jobDescription) {
            alert('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        console.log("Form Data: ",formData);
        const prompt = `You are a professional career coach and resume optimization expert. 
        Your task is to generate a personalized cover letter, improve the resume content, 
        and provide an ATS (Applicant Tracking System) analysis.

        Inputs:
        Company Name: ${formData.companyName}
        Experience Level: ${formData.applyingAsA}  (Fresher / Experienced)
        Job Description: ${formData.jobDescription}
        Current Resume: ${formData.currentResume} (If empty, assume no resume exists and create a draft)
        Preferred Tone: ${formData.coverLetterTone}

        Output (format clearly in sections):

        1. Tailored Cover Letter  
        Write a professional cover letter addressed to ${formData.companyName}.  
        Use the specified tone: ${formData.coverLetterTone}.  
        Highlight relevant skills and experiences based on the job description.  

        2. Updated Resume Content  
        Suggest optimized resume summary, bullet points, and skills tailored to ${formData.jobDescription}.  
        Ensure the content is concise, achievement-focused, and ATS-friendly.  

        3. Keyword Match Analysis  
        Extract the most important keywords from the job description.  
        Check if they exist in the provided resume (if given).  
        List missing keywords that should be added.  

        4. ATS Score Estimate (0-100)  
        Provide a rough ATS match score for the current resume against the job description.  
        Explain the reasoning briefly (e.g., missing keywords, formatting issues, irrelevant content).  

        Ensure the response is structured, clear, and easy to display in a React app.
        `;

        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        const options = {
            method: 'POST',
            headers: {
                'X-goog-api-key': 'AIzaSyAu0dtrTO_KDCjKIT1I2PGY4iMidM35nZs',
                'Content-Type': ''
            },
            body: `{"contents":[{"parts":[{"text":"${prompt}"}]}]}`
        };
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            console.log('Generated Gemini Data: ',data);
            console.log('Generated Gemini Data: ',data.candidates[0].content.parts[0].text);
            setGeminiResponse(data.candidates[0].content.parts[0].text);
        } catch (error) {
            console.error(error);
            alert('An error occurred while generating content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="home-modern-bg">
            <div className="home-modern-hero">
                <span className="icon">📝</span>
                <div>
                    <div className="home-modern-title">Resume Builder</div>
                    <div className="home-modern-desc">Create tailored cover letters and resume suggestions powered by Gemini AI</div>
                </div>
            </div>
            <div className="home-modern-container">
                <div>
                    <div className="home-modern-form-card">
                        <div className="home-modern-form-title">Application Details</div>
                        <div className="home-modern-form-step">
                            <span>Step 1 of 1</span>
                            <div className="home-modern-progress">
                                <div className="home-modern-progress-bar" style={{width: '100%'}}></div>
                            </div>
                        </div>
                        <form autoComplete="off">
                            <div className="home-modern-form-group">
                                <input type="text" className="home-modern-input" id="companyName" placeholder=" "
                                    value={formData.companyName} onChange={e=>setFormData({...formData,companyName:e.target.value})}
                                />
                                <label htmlFor="companyName" className="home-modern-label">Company Name</label>
                            </div>
                            <div className="home-modern-form-group">
                                <select className="home-modern-input" id="applyingAsA"
                                    value={formData.applyingAsA} onChange={e=>setFormData({...formData,applyingAsA:e.target.value})}
                                >
                                    <option value="">Select Experience</option>
                                    <option value="Fresher">Fresher</option>
                                    <option value="Experienced">Experienced</option>
                                </select>
                                <label htmlFor="applyingAsA" className="home-modern-label">Applying as a</label>
                            </div>
                            <div className="home-modern-form-group">
                                <select className="home-modern-input" id="coverLetterTone"
                                    value={formData.coverLetterTone} onChange={e=>setFormData({...formData,coverLetterTone:e.target.value})}
                                >
                                    <option value="">Select Tone</option>
                                    <option value="Formal">Formal</option>
                                    <option value="Informal">Informal</option>
                                    <option value="Casual">Casual</option>
                                </select>
                                <label htmlFor="coverLetterTone" className="home-modern-label">Cover Letter Tone</label>
                            </div>
                            <div className="home-modern-form-group">
                                <textarea className="home-modern-input" id="jobDescription" placeholder=" " rows={5}
                                    value={formData.jobDescription} onChange={e=>setFormData({...formData,jobDescription:e.target.value})}
                                ></textarea>
                                <label htmlFor="jobDescription" className="home-modern-label">Job Description</label>
                            </div>
                            <div className="home-modern-form-group">
                                <textarea className="home-modern-input" id="currentResume" placeholder=" " rows={5}
                                    value={formData.currentResume} onChange={e=>setFormData({...formData,currentResume:e.target.value})}
                                ></textarea>
                                <label htmlFor="currentResume" className="home-modern-label">Current Resume</label>
                            </div>
                            <button 
                                type="button" 
                                className="home-modern-btn" 
                                onClick={handleGenerateData}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Generating...' : 'Generate'}
                            </button>
                        </form>
                    </div>
                </div>
                <div>
                    <div className="home-modern-preview-card">
                        <div className="home-modern-preview-tabs">
                            {geminiResponse && parseGeminiResponse(geminiResponse).map((section, idx) => (
                                <button
                                    key={idx}
                                    className={`home-modern-tab${activeTab === idx ? ' active' : ''}`}
                                    onClick={()=>setActiveTab(idx)}
                                    type="button"
                                >{section.title}</button>
                            ))}
                        </div>
                        <div className="home-modern-preview-content">
                            {geminiResponse ? (
                                <div dangerouslySetInnerHTML={{__html: parseGeminiResponse(geminiResponse)[activeTab]?.html || ''}} />
                            ) : (
                                <div style={{color:'#64748b',textAlign:'center',padding:'2rem 0'}}>No generated content yet — fill the form and click Generate</div>
                            )}
                        </div>
                        {geminiResponse && (
                            <button className="home-modern-copy-btn" type="button"
                                onClick={()=>copySection(parseGeminiResponse(geminiResponse)[activeTab]?.html || '')}
                            >Copy Section</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default HomePage;