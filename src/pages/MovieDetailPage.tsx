
import { useParams } from 'react-router-dom';

const MovieDetailPage = () => {
    const { id } = useParams();
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Movie Details</h1>
            <p>Movie ID: {id}</p>
            {/* Movie details will go here */}
        </div>
    );
};

export default MovieDetailPage;
