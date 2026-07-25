import { useState } from 'react'
import KnowledgeList from './KnowledgeList'
import KnowledgeCreate from './KnowledgeCreate'

const KnowledgeManager = () => {
    const [isCreating, setIsCreating] = useState(false)

    return (
        <div className="w-full">
            {isCreating ? (
                <KnowledgeCreate onBackToList={() => setIsCreating(false)} />
            ) : (
                <KnowledgeList onAddClick={() => setIsCreating(true)} />
            )}
        </div>
    )
}

export default KnowledgeManager