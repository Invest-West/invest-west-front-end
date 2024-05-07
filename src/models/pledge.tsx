/**
 * Investor pledge interface
 */
export default interface Pledge {
    id: string;
    anid: string;
    amount: number | "";
    date: number;
    investorID: string;
    projectID: string;
    status: number;
}

export default interface StudentPledge {
    id: string;
    anid: string;
    amount: number | "";
    date: number;
    studentID: string;
    studentProjectID: string;
    status: number;
}