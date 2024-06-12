import React, { useState } from 'react';
import { getFirestore, updateDoc, doc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';

const ExitSurvey = ({ response_id, app }: { response_id: string, app: any }) => {
    const db = getFirestore(app);
    const auth = getAuth(app);

    const [formData, setFormData] = useState({
        aiToolTypicalUsage: '',
        mentalDemand: 10,
        aihelpful: 5,
        howaihelpful: '',
        howaiimproved: '',
        finalcomments: ''
    });

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSliderChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: Number(value) });
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const time_completed_string = new Date().toISOString();
        try {
            await updateDoc(doc(db, "responses", response_id), {
                ...formData,
                time_completed_exit_survey: time_completed_string
            });
            localStorage.clear();
            await signOut(auth);
            alert('Survey submitted successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error writing document: ', error);
            alert('There was an error submitting the survey.');
        }
    };

    return (
        <div className="exit-survey-popup">
            <form onSubmit={handleSubmit}>
                <div className="form-control" id="aiToolTypicalUsage_label">
                    <label htmlFor="aiToolTypicalUsage">
                        Thinking of your experience using AI tools outside of today’s session, do you think that your session today reflects your typical usage of AI tools?
                    </label>
                    <br />
                    <select name="aiToolTypicalUsage" id="aiToolTypicalUsage" required onChange={handleChange}>
                        <option value="" disabled selected hidden></option>
                        <option value="1">Strongly Disagree</option>
                        <option value="2">Disagree</option>
                        <option value="3">Neutral</option>
                        <option value="4">Agree</option>
                        <option value="5">Strongly Agree</option>
                    </select>
                </div>
                <br />

                <div className="form-control">
                    <label htmlFor="mentalDemand">How mentally demanding was the study?</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <span>Low</span>
                        <input type="range" style={{ flexGrow: 1 }} id="mentalDemand" name="mentalDemand" min="1" max="20" value={formData.mentalDemand} onChange={handleSliderChange} />
                        <span>High</span>
                        <output className="slider-value" htmlFor="mentalDemand" id="mentalDemandValue">{formData.mentalDemand}</output>
                    </div>
                </div>
                <br />

                <div className="form-control">
                <label htmlFor="aihelpful">How helpful was the AI? </label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <span>Low</span>
                        <input type="range" style={{ flexGrow: 1 }} id="aihelpful" name="aihelpful" min="1" max="10" value={formData.aihelpful} onChange={handleSliderChange} />
                        <span>High</span>
                        <output className="slider-value" htmlFor="aihelpful" id="aihelpfulValue">{formData.aihelpful}</output>
                    </div>
                </div>
                <br />

{/*                 Similar slider controls for other questions
                {['physicalDemand', 'temporalDemand', 'performance', 'effort', 'frustration', 'aihelpful'].map((name) => (
                    <div className="form-control" key={name}>
                        <label htmlFor={name}>{name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <span>Low</span>
                            <input type="range" style={{ flexGrow: 1 }} id={name} name={name} min="1" max="20" value={formData[name]} onChange={handleSliderChange} />
                            <span>High</span>
                            <output className="slider-value" htmlFor={name} id={`${name}Value`}>{formData[name]}</output>
                        </div>
                    </div>
                ))}
                <br /> */}

                <div className="form-control" id="howaihelpful_label">
                    <label htmlFor="howaihelpful">
                        In which ways was the AI assistant helpful? What did it allow you to accomplish?
                    </label>
                    <br />
                    <textarea name="howaihelpful" style={{ width: '100%' }} id="howaihelpful"  value={formData.howaihelpful} onChange={handleChange}></textarea>
                </div>
                <br />

                <div className="form-control" id="howaiimproved_label">
                    <label htmlFor="howaiimproved">
                        How could the AI suggestions be improved?
                    </label>
                    <br />
                    <textarea name="howaiimproved" style={{ width: '100%' }} id="howaiimproved"  value={formData.howaiimproved} onChange={handleChange}></textarea>
                </div>
                <br />

                <div className="form-control">
                    <label htmlFor="finalcomments">
                        Additional comments (Optional): anything went wrong? any feedback?
                    </label>
                    <br />
                    <textarea name="finalcomments" style={{ width: '100%' }} id="finalcomments"  value={formData.finalcomments} onChange={handleChange}></textarea>
                </div>
                <br />

                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default ExitSurvey;
