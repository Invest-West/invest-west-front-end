/**
 * Investor pledge interface
 */
export default interface StudentPledge {
    id: string;
    anid: string;
    amount: number | "";
    date: number;
    studentID: string;
    studentProjectID: string;
    status: number;
}